self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/vite.svg',
    actions: [
      { action: 'done', title: '✅ Mark Done' }
    ],
    data: { todoId: data.todoId }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'done') {
    event.waitUntil(
      fetch(`/api/todos/${event.notification.data.todoId}/toggle`, { 
        method: 'PATCH' 
      })
    );
  }
});
