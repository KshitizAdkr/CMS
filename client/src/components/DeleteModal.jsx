export default function DeleteModal({ show, label, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body text-center p-4">
            <div className="delete-modal-icon"><i className="bi bi-trash3"></i></div>
            <h5 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>Confirm Delete</h5>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
              Are you sure you want to delete <strong>{label}</strong>? This action cannot be undone.
            </p>
            <div className="d-flex gap-2 justify-content-center mt-3">
              <button type="button" className="btn btn-light btn-sm px-4" onClick={onCancel}>Cancel</button>
              <button type="button" className="btn btn-danger btn-sm px-4" onClick={onConfirm}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
