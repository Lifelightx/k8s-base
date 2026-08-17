export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.out ? ' out' : ''}`}>
          <span className={`t-dot ${t.type}`} />
          {t.message}
          <button
            onClick={() => onDismiss(t.id)}
            style={{ marginLeft:8, background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'0.75rem', lineHeight:1 }}
            aria-label="Dismiss"
          >&#x2715;</button>
        </div>
      ))}
    </div>
  );
}
