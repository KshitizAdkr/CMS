import { useState, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, title, msg, duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container-mc" id="toastContainer">
        {toasts.map(t => {
          const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
          return (
            <div key={t.id} className={`mc-toast ${t.type}`}>
              <i className={`bi ${icons[t.type] || icons.info} toast-icon`}></i>
              <div className="toast-body">
                <strong>{t.title}</strong>
                {t.msg && <span>{t.msg}</span>}
              </div>
              <button className="toast-close" onClick={() => removeToast(t.id)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
