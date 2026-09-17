Brd Todo Features
Business Requirements Document (BRD)
k8s-todo — Feature Expansion v2.0
Project: k8s-todo
Date: 2026-09-16
Author: Antigravity AI
Status: Draft — Pending Approval

1. Executive Summary
The k8s-todo application currently provides a functional microservices-based todo platform with auth, a Node.js backend, a Python LLM service (Ollama), Redis rate-limiting, Socket.io real-time updates, and a React frontend. This BRD defines 10 features to transform it into a genuinely useful daily-use productivity tool.

The architecture will be extended, not replaced — all new features build on the existing stack.

2. Current Architecture Reference

[Browser] → [Gateway :5000] → [Auth Service :5002]
                           → [Backend Service :5001] ↔ [MongoDB]
                           → [LLM Service :5003]    ↔ [Ollama]
                           → [Socket.io WS]
                             (all via Redis BullMQ queues)
Existing Tech Stack:

Gateway: Express.js + http-proxy-middleware + Redis rate limiter
Backend: Express.js + Mongoose + BullMQ + Socket.io
Auth: Express.js + JWT
LLM: FastAPI + httpx → Ollama
Frontend: React (Vite) + Tailwind
Infra: Kubernetes + Helm, MongoDB PVC, Redis
3. Feature Catalogue
#	Feature	Priority	Effort	Sprint
F-01	Due Dates & Reminders	🔴 Critical	Medium	1
F-02	Tags / Labels	🔴 Critical	Low	1
F-03	Sub-tasks (AI-Persisted Checklists)	🔴 Critical	Medium	1
F-04	Full-Text Search	🟠 High	Low	2
F-05	Recurring Todos	🟠 High	Medium	2
F-06	Projects / Workspaces	🟠 High	Medium	2
F-07	Progress & Streaks Dashboard	🟡 Medium	Medium	3
F-08	AI Smart Prioritization	🟡 Medium	Medium	3
F-09	Browser Push Notifications	🟡 Medium	High	3
F-10	Shared / Collaborative Todos	🟢 Low	High	4
4. Detailed Feature Requirements & Code Plans
F-01 — Due Dates & Reminders
Business Requirement
Users must be able to assign a deadline to any todo. Overdue todos must be visually highlighted. A background job must send reminder notifications (email/Socket.io push) 24 hours and 1 hour before the due date.

Acceptance Criteria
 dueDate field on every todo (optional, ISO 8601)
 Overdue todos shown in red on the frontend
 Reminder job fires at T-24h and T-1h
 User can enable/disable reminders per todo
Code Plan
Backend — Todo.js model (backend/src/models/Todo.js)

js

// ADD to todoSchema:
dueDate: {
  type: Date,
  default: null,
  index: true
},
remindersEnabled: {
  type: Boolean,
  default: true
},
remindersSent: {
  type: [String],   // e.g. ['24h', '1h']
  default: []
}
Backend — todos.js route (backend/src/routes/todos.js)

js

// MODIFY POST / and PUT /:id to accept dueDate + remindersEnabled
const { text, priority = 'medium', dueDate, remindersEnabled } = req.body;
// include dueDate and remindersEnabled in create/update calls
Backend — NEW reminder.worker.js (backend/src/services/reminder.worker.js)

js

// BullMQ repeatable job — runs every 5 minutes
const reminderQueue = new Queue('reminder-queue', redisOptions);
const reminderScheduler = new Worker('reminder-queue', async (job) => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24*60*60*1000);
  const in1h  = new Date(now.getTime() + 60*60*1000);
  // Find todos due within next hour, reminders not sent, user has enabled them
  const dueSoon = await Todo.find({
    dueDate: { $lte: in24h },
    completed: false,
    remindersEnabled: true,
    remindersSent: { $nin: ['24h'] }
  }).populate('userId');
  for (const todo of dueSoon) {
    io.to(todo.userId.toString()).emit('reminder', { todo, type: '24h' });
    await Todo.findByIdAndUpdate(todo._id, { $addToSet: { remindersSent: '24h' } });
  }
  // repeat for 1h window
}, redisOptions);
Backend — queue.service.js — add reminderQueue init; pass io instance.

Frontend — TodoItem.jsx

jsx

// ADD overdue badge logic:
const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();
// Apply red border/text class when isOverdue === true
// ADD date picker input in ComposeTodo.jsx / edit mode
<input type="datetime-local" value={dueDate} onChange={...} />
Frontend — Socket.io handler in App.jsx

js

socket.on('reminder', ({ todo, type }) => {
  showToast(`⏰ Reminder: "${todo.text}" is due in ${type === '24h' ? '24 hours' : '1 hour'}`, 'warning');
});
F-02 — Tags / Labels
Business Requirement
Users can assign multiple free-form tags to todos and filter the todo list by one or more tags. A tag autocomplete dropdown shows previously used tags.

Acceptance Criteria
 tags array field on todo schema
 GET /api/todos?tags=work,urgent returns filtered results
 GET /api/todos/tags returns all unique tags for the user
 Frontend shows tag chips on each todo and a tag filter bar
Code Plan
Backend — Todo.js model

js

// ADD:
tags: {
  type: [String],
  default: [],
  index: true
}
Backend — todos.js route

js

// MODIFY GET / to accept tags filter:
const { tags } = req.query; // comma-separated
if (tags) query.tags = { $in: tags.split(',') };
// ADD new route:
router.get('/tags', async (req, res, next) => {
  try {
    const tags = await Todo.distinct('tags', { userId: req.user.id });
    res.json(tags);
  } catch(err) { next(err); }
});
Frontend — ComposeTodo.jsx — add tag input with pill UI (type & press Enter to add a tag)

Frontend — TodoItem.jsx — render todo.tags as colored pill badges

Frontend — LandingPage.jsx — add tag filter bar above todo list; clicking a tag chip filters the list

F-03 — Sub-tasks (AI-Persisted Checklists)
Business Requirement
Each todo can have a list of sub-tasks (checklist items). When a user clicks "Generate Plan" on a todo, the LLM /api/ai/plan response is parsed and saved as sub-tasks on the todo. Users can also manually add/remove sub-tasks. A todo is shown as partially complete (progress bar) if some sub-tasks are done.

Acceptance Criteria
 subtasks array embedded in Todo schema
 PATCH /api/todos/:id/subtasks — add/update/delete subtasks
 LLM plan is auto-parsed and saved on "Generate Plan" click
 Progress bar on TodoItem shows completedSubtasks / totalSubtasks
Code Plan
Backend — Todo.js model

js

// ADD:
subtasks: [{
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false }
}]
Backend — todos.js route — NEW endpoints

js

// POST a subtask
router.post('/:id/subtasks', async (req, res, next) => {
  const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
  todo.subtasks.push({ text: req.body.text });
  await todo.save();
  res.json(todo);
});
// PATCH toggle a subtask
router.patch('/:id/subtasks/:subtaskId', async (req, res, next) => {
  const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
  const sub = todo.subtasks.id(req.params.subtaskId);
  sub.completed = !sub.completed;
  await todo.save();
  res.json(todo);
});
// DELETE a subtask
router.delete('/:id/subtasks/:subtaskId', async (req, res, next) => {
  await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $pull: { subtasks: { _id: req.params.subtaskId } } },
    { new: true }
  );
  res.json({ message: 'Subtask removed' });
});
LLM service — app.py — fix existing bug: response key is "response " (trailing space). Change to "response".

Frontend — TaskDetailsPage.jsx — replace raw plan text display with:

Call POST /api/ai/plan, parse numbered list response into array
Call POST /api/todos/:id/subtasks for each item to save them
Render saved todo.subtasks as interactive checklist
Frontend — TodoItem.jsx — add progress bar:

jsx

const done = todo.subtasks?.filter(s => s.completed).length || 0;
const total = todo.subtasks?.length || 0;
// show: <div style={{ width: `${(done/total)*100}%` }} /> if total > 0
F-04 — Full-Text Search
Business Requirement
A search bar allows users to search across todo text and description fields. Results update as user types (debounced 300ms).

Acceptance Criteria
 MongoDB $text index on text + description
 GET /api/todos?search=keyword returns matching todos
 Frontend search bar with debounce
Code Plan
Backend — Todo.js model

js

// ADD compound text index at the bottom of the schema:
todoSchema.index({ text: 'text', description: 'text' });
Backend — todos.js route

js

// MODIFY GET / — add search handling before the find call:
const { search } = req.query;
if (search) {
  query.$text = { $search: search };
}
const todos = await Todo.find(query)
  .sort(search ? { score: { $meta: 'textScore' } } : { [sort]: sortDir });
Frontend — LandingPage.jsx

jsx

// ADD search state and debounce:
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300); // new hook
// ADD hook: frontend/src/hooks/useDebounce.js
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
// Pass debouncedSearch as query param to api.getTodos()
F-05 — Recurring Todos
Business Requirement
A todo can be set as recurring (daily, weekly, monthly). When a recurring todo is completed, a new copy is automatically created with the next due date. The user can see the recurrence badge on todo items.

Acceptance Criteria
 recurrence field: none | daily | weekly | monthly
 On toggle-complete for a recurring todo, backend creates next occurrence
 Frontend shows recurrence indicator icon
Code Plan
Backend — Todo.js model

js

// ADD:
recurrence: {
  type: String,
  enum: ['none', 'daily', 'weekly', 'monthly'],
  default: 'none'
},
nextDueDate: {  // computed from dueDate + recurrence
  type: Date,
  default: null
}
Backend — todos.js route — MODIFY PATCH /:id/toggle

js

// After saving toggled todo:
if (todo.completed && todo.recurrence !== 'none' && todo.dueDate) {
  const next = new Date(todo.dueDate);
  if (todo.recurrence === 'daily')   next.setDate(next.getDate() + 1);
  if (todo.recurrence === 'weekly')  next.setDate(next.getDate() + 7);
  if (todo.recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
  await Todo.create({
    text: todo.text,
    userId: todo.userId,
    priority: todo.priority,
    tags: todo.tags,
    dueDate: next,
    recurrence: todo.recurrence,
    remindersEnabled: todo.remindersEnabled
  });
}
Frontend — ComposeTodo.jsx — add recurrence select dropdown:

jsx

<select value={recurrence} onChange={...}>
  <option value="none">Does not repeat</option>
  <option value="daily">Daily</option>
  <option value="weekly">Weekly</option>
  <option value="monthly">Monthly</option>
</select>
Frontend — TodoItem.jsx — show 🔁 icon when todo.recurrence !== 'none'

F-06 — Projects / Workspaces
Business Requirement
Users can organize todos into named Projects (e.g., "Work", "Personal", "Shopping"). Each todo belongs to exactly one project (default: "Inbox"). A sidebar lists all projects with todo counts. Clicking a project filters the list.

Acceptance Criteria
 New Project model with name, color, userId
 Todo schema has optional projectId FK
 GET /api/projects — list user's projects
 POST /api/projects — create project
 DELETE /api/projects/:id — delete (moves todos to Inbox)
 Frontend sidebar with project list
Code Plan
Backend — NEW Project.js model (backend/src/models/Project.js)

js

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  color: { type: String, default: '#6366f1' }, // hex color
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }
}, { timestamps: true });
module.exports = mongoose.model('Project', projectSchema);
Backend — Todo.js model

js

// ADD:
projectId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Project',
  default: null,
  index: true
}
Backend — NEW projects.js route (backend/src/routes/projects.js)

js

router.get('/', ...)    // GET all projects for user
router.post('/', ...)   // Create project
router.put('/:id', ...) // Rename / recolor
router.delete('/:id', async (req, res, next) => {
  // Move todos back to inbox (null)
  await Todo.updateMany({ projectId: req.params.id, userId: req.user.id }, { $set: { projectId: null } });
  await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Project deleted, todos moved to Inbox' });
});
Backend — app.js — mount router.use('/api/projects', require('./routes/projects'))

Gateway — server.js — add proxy entry for /api/projects → backend service

Frontend — NEW Sidebar.jsx component:

Renders "📥 Inbox" + list of user's projects with dot color indicator and count badge
Active project highlighted; clicking sets activeProjectId state in App
Frontend — LandingPage.jsx — pass projectId filter to todo fetch query

Frontend — ComposeTodo.jsx — add project select dropdown

F-07 — Progress & Streaks Dashboard
Business Requirement
A dedicated dashboard page shows: total vs completed todos over time (last 30 days bar chart), current daily completion streak, and a GitHub-style activity heatmap. Data is derived from completedAt timestamps.

Acceptance Criteria
 completedAt Date field auto-set when todo is marked complete
 GET /api/todos/analytics?days=30 — returns daily completion counts
 Frontend dashboard with bar chart + streak counter + heatmap
Code Plan
Backend — Todo.js model

js

// ADD:
completedAt: {
  type: Date,
  default: null
}
Backend — todos.js PATCH toggle — set/clear completedAt:

js

todo.completedAt = todo.completed ? new Date() : null;
Backend — NEW analytics route in todos.js

js

router.get('/analytics', async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const data = await Todo.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.user.id), completedAt: { $gte: since } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
        count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);
  res.json(data); // [{ _id: '2026-09-15', count: 5 }, ...]
});
Frontend — NEW DashboardPage.jsx component:

Use recharts library (add to package.json) for bar chart
Streak calculation: walk backward from today, count consecutive days with count > 0
Heatmap: a 7×N grid of colored cells (green intensity = count) similar to GitHub contributions
Frontend — Router — add /dashboard route, nav link in header

F-08 — AI Smart Prioritization
Business Requirement
A "✨ Reprioritize" button sends all active todos to the LLM, which returns a suggested priority (high/medium/low) for each based on text content, due dates, and context. User sees a preview diff and can apply or cancel.

Acceptance Criteria
 POST /api/ai/prioritize — accepts list of todos, returns [{ id, suggestedPriority, reason }]
 Frontend shows a modal with before/after priority comparison
 User can apply all suggestions or selectively apply individual ones
Code Plan
LLM service — app.py — NEW endpoint

python

class PrioritizeRequest(BaseModel):
    todos: list[dict]   # [{id, text, dueDate, currentPriority}]
@router.post("/prioritize")
async def prioritize_todos(req: PrioritizeRequest):
    items = "\n".join([
        f"- ID:{t['id']} | Text:{t['text']} | Due:{t.get('dueDate','none')} | Current:{t['currentPriority']}"
        for t in req.todos
    ])
    prompt = f"""You are a productivity assistant. For each todo below, suggest the best priority level (high/medium/low) and give a one-sentence reason.
Return ONLY JSON array: [{{"id":"...","priority":"high|medium|low","reason":"..."}}]
Todos:
{items}"""
    # Call Ollama, parse JSON response
    # Return parsed list
Backend — NEW route in todos.js (or forward via gateway):

js

// The gateway already proxies /api/ai/* to LLM service.
// Frontend calls /api/ai/prioritize directly.
// Backend exposes PATCH /api/todos/bulk-priority to apply suggestions:
router.patch('/bulk-priority', async (req, res, next) => {
  // req.body = [{ id, priority }]
  const ops = req.body.map(({ id, priority }) => ({
    updateOne: { filter: { _id: id, userId: req.user.id }, update: { $set: { priority } } }
  }));
  await Todo.bulkWrite(ops);
  res.json({ updated: ops.length });
});
Frontend — NEW ReprioritizeModal.jsx component:

Shows a table: Todo text | Current priority | Suggested priority | Reason
Checkboxes to select which suggestions to apply
"Apply Selected" → calls PATCH /api/todos/bulk-priority
F-09 — Browser Push Notifications
Business Requirement
Users can subscribe to Web Push notifications. The backend sends push messages for: due-date reminders, new shared todos, and AI processing completion. Works even when the browser tab is closed.

Acceptance Criteria
 Frontend registers a service worker and requests Push permission
 Backend stores user's push subscription in the User model
 Reminder worker (F-01) sends web push alongside Socket.io
 Notification shows todo title and action buttons (Mark Done / Snooze)
Code Plan
Frontend — NEW public/sw.js (service worker):

js

self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    actions: [
      { action: 'done', title: '✅ Mark Done' },
      { action: 'snooze', title: '⏰ Snooze 1h' }
    ],
    data: { todoId: data.todoId }
  });
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'done') {
    fetch(`/api/todos/${event.notification.data.todoId}/toggle`, { method: 'PATCH' });
  }
});
Frontend — App.jsx — add push subscription on login:

js

async function subscribeToPush() {
  const reg = await navigator.serviceWorker.register('/sw.js');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VITE_VAPID_PUBLIC_KEY
  });
  await api.post('/api/auth/push-subscribe', sub);
}
Auth service — User model — add pushSubscription: Object field

Auth service — NEW route POST /api/auth/push-subscribe — saves subscription to User doc

Backend — reminder.worker.js — add web-push npm package:

js

const webpush = require('web-push');
webpush.setVapidDetails('mailto:admin@example.com', VAPID_PUBLIC, VAPID_PRIVATE);
// In reminder worker, after Socket.io emit:
if (user.pushSubscription) {
  await webpush.sendNotification(user.pushSubscription, JSON.stringify({
    title: `⏰ Due soon: ${todo.text}`,
    body: `Due in ${type === '24h' ? '24 hours' : '1 hour'}`,
    todoId: todo._id
  }));
}
K8s ConfigMap — add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars (generate once with web-push generate-vapid-keys)

F-10 — Shared / Collaborative Todos
Business Requirement
A user can share a specific todo or an entire project with another registered user by email. Shared users can view and toggle completion of shared items. The owner can revoke access. Real-time updates propagate to all collaborators via Socket.io.

Acceptance Criteria
 sharedWith: [{ userId, role: 'viewer'|'editor' }] on Todo and Project models
 POST /api/todos/:id/share — accepts { email, role }, finds user, adds to sharedWith
 GET /api/todos/shared — returns todos shared WITH the current user
 Socket.io rooms per todo for real-time collaborative updates
 Frontend share modal with email input and collaborator list
Code Plan
Backend — Todo.js model

js

// ADD:
sharedWith: [{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  role: { type: String, enum: ['viewer', 'editor'], default: 'editor' }
}]
Backend — Project.js model — same sharedWith array

Backend — todos.js — NEW share routes

js

// Share a todo
router.post('/:id/share', async (req, res, next) => {
  const { email, role = 'editor' } = req.body;
  // Call auth service (internal) to resolve email → userId
  const { data: targetUser } = await axios.get(`${AUTH_SERVICE}/api/auth/user-by-email?email=${email}`);
  if (!targetUser) return res.status(404).json({ message: 'User not found' });
  await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $addToSet: { sharedWith: { userId: targetUser._id, role } } }
  );
  // Notify target user via Socket.io
  io.to(targetUser._id.toString()).emit('todoShared', { todoId: req.params.id });
  res.json({ message: 'Shared successfully' });
});
// Get todos shared with current user
router.get('/shared', async (req, res, next) => {
  const todos = await Todo.find({ 'sharedWith.userId': req.user.id });
  res.json(todos);
});
// Revoke share
router.delete('/:id/share/:userId', async (req, res, next) => {
  await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $pull: { sharedWith: { userId: req.params.userId } } }
  );
  res.json({ message: 'Access revoked' });
});
Auth service — NEW internal route GET /api/auth/user-by-email (internal only, not exposed via gateway)

Backend — protect.js middleware — update to also allow access when sharedWith contains req.user.id

Frontend — NEW ShareModal.jsx component:

Email input + role dropdown
Renders existing sharedWith list with "Remove" buttons
Integrates into TaskDetailsPage.jsx
Frontend — Socket.io in App.jsx

js

socket.on('todoShared', ({ todoId }) => {
  showToast(`📨 A todo was shared with you!`, 'info');
  fetchTodos(); // refresh
});
5. Database Schema — Final State

Todo {
  _id, text, userId, completed, completedAt,
  description, priority,
  dueDate, remindersEnabled, remindersSent[],
  recurrence, nextDueDate,
  tags[],
  subtasks[{ _id, text, completed }],
  projectId → Project,
  sharedWith[{ userId → User, role }],
  createdAt, updatedAt
}
Project {
  _id, name, color, userId,
  sharedWith[{ userId, role }],
  createdAt, updatedAt
}
User (auth service) {
  _id, email, passwordHash, pushSubscription,
  createdAt, updatedAt
}
6. New API Endpoints Summary
Method	Path	Feature	Service
GET	/api/todos?search=&tags=&projectId=	F-02, F-04, F-06	Backend
GET	/api/todos/tags	F-02	Backend
GET	/api/todos/analytics?days=30	F-07	Backend
GET	/api/todos/shared	F-10	Backend
POST	/api/todos/:id/subtasks	F-03	Backend
PATCH	/api/todos/:id/subtasks/:sid	F-03	Backend
DELETE	/api/todos/:id/subtasks/:sid	F-03	Backend
POST	/api/todos/:id/share	F-10	Backend
DELETE	/api/todos/:id/share/:userId	F-10	Backend
PATCH	/api/todos/bulk-priority	F-08	Backend
GET	/api/projects	F-06	Backend
POST	/api/projects	F-06	Backend
PUT	/api/projects/:id	F-06	Backend
DELETE	/api/projects/:id	F-06	Backend
POST	/api/ai/prioritize	F-08	LLM
POST	/api/auth/push-subscribe	F-09	Auth
GET	/api/auth/user-by-email	F-10	Auth (internal)
7. New Files to Create
Backend (backend/src/)
models/Project.js — F-06
routes/projects.js — F-06
services/reminder.worker.js — F-01, F-09
Frontend (frontend/src/)
hooks/useDebounce.js — F-04
components/Sidebar.jsx — F-06
components/DashboardPage.jsx — F-07
components/ReprioritizeModal.jsx — F-08
components/ShareModal.jsx — F-10
public/sw.js — F-09 (service worker)
LLM Service (llm/)
Extended app.py with /prioritize endpoint — F-08
8. Files to Modify
File	Features
backend/src/models/Todo.js	F-01, F-02, F-03, F-05, F-06, F-07, F-10
backend/src/routes/todos.js	F-01, F-02, F-03, F-04, F-05, F-07, F-08, F-10
backend/src/services/queue.service.js	F-01 (pass io to reminder worker)
backend/src/middleware/protect.js	F-10 (shared access)
auth/src/models/User.js	F-09 (pushSubscription)
auth/src/routes/*.js	F-09, F-10 (new routes)
gateway/server.js	F-06 (proxy /api/projects)
frontend/src/App.jsx	F-01, F-06, F-09, F-10 (socket events, routing)
frontend/src/components/LandingPage.jsx	F-02, F-04, F-06
frontend/src/components/ComposeTodo.jsx	F-01, F-02, F-05, F-06
frontend/src/components/TodoItem.jsx	F-01, F-02, F-03, F-05
frontend/src/components/TaskDetailsPage.jsx	F-03, F-10
frontend/src/services/api.js	all features (new API calls)
llm/app.py	F-03 (bug fix), F-08
k8s/todo-configmap.yaml	F-09 (VAPID keys)
k8s/todo-secret.yaml	F-09 (VAPID private key)
9. New npm / pip Dependencies
Backend (backend/)
Package	Feature
web-push	F-09
Frontend (frontend/)
Package	Feature
recharts	F-07 (charts)
react-datepicker	F-01 (date picker)
LLM (llm/)
Package	Feature
No new deps	—
10. Sprint Plan
Sprint 1 (Foundation) — F-01, F-02, F-03
Schema changes (Due Date, Tags, Subtasks)
Backend routes for all three
Frontend: date picker, tag chips, subtask checklist
Wire AI plan → save subtasks
Sprint 2 (Organization) — F-04, F-05, F-06
Full-text search (index + query + frontend debounce)
Recurring todos (backend toggle logic + frontend UI)
Projects model + routes + sidebar
Sprint 3 (Intelligence) — F-07, F-08, F-09
Analytics aggregation + dashboard page + charts
AI prioritization endpoint + modal
Service worker + Web Push infrastructure
Sprint 4 (Collaboration) — F-10
Sharing model + routes
Auth service user-by-email lookup
Frontend share modal + real-time notifications
11. Open Questions
IMPORTANT

Email notifications (F-01): Should the reminder system send actual emails (requires SMTP / SendGrid config) or only in-app Socket.io + Web Push notifications?
VAPID keys (F-09): Will these be generated and stored as Kubernetes Secrets, or managed externally (e.g., Vault)?
Project deletion (F-06): When a project is deleted, should todos be moved to Inbox (null projectId) or cascade-deleted?
Collaboration scope (F-10): Should sharing work at the individual todo level, project level, or both?
LLM model (F-08): The current Ollama model is used for description generation. Is the same model suitable for JSON-structured prioritization output, or should structured output mode / a different model be used?
Document generated: 2026-09-16