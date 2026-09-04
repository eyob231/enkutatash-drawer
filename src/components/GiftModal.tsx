interface GiftModalProps {
  isOpen: boolean;
  image: string | null;
  onClose: () => void;
  onSend: () => void;
  onSave: () => void;
}

export function GiftModal({ isOpen, image, onClose, onSend, onSave }: GiftModalProps) {
  if (!isOpen || !image) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gift-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2>🎁 Send as Enkutatash Gift</h2>
        <div className="gift-preview">
          <img src={image} alt="Your drawing" />
        </div>
        <p className="gift-desc">
          Send your flower drawing to a friend for <strong>Enkutatash</strong>! 🇪🇹
        </p>
        <div className="gift-message">
          <span>Message: </span>
          <em>"Happy Enkutatash! 🌸🌼🌺" </em>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onSave}>
            💾 Save Image
          </button>
          <button className="btn btn-primary" onClick={onSend}>
            🎁 Send Gift
          </button>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: var(--sp-lg);
        }
        .modal-content {
          background: linear-gradient(180deg, #1a1500 0%, #0d0d1a 100%);
          border-radius: var(--radius-lg);
          padding: var(--sp-xl);
          max-width: 360px;
          width: 100%;
          position: relative;
          text-align: center;
          box-shadow: 0 0 24px rgba(255,215,0,0.2);
        }
        .modal-content h2 {
          font-size: 18px;
          margin-bottom: var(--sp-md);
          color: var(--meskel-yellow);
        }
        .gift-preview {
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--sp-md);
          border: 2px solid rgba(255,215,0,0.6);
          box-shadow: 0 0 12px rgba(255,215,0,0.3);
        }
        .gift-preview img {
          width: 100%;
          display: block;
        }
        .gift-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: var(--sp-sm);
        }
        .gift-message {
          font-size: 13px;
          color: var(--meskel-yellow);
          margin-bottom: var(--sp-md);
          padding: var(--sp-sm);
          background: rgba(255,215,0,0.1);
          border-radius: var(--radius-sm);
        }
        .gift-message span {
          margin-right: var(--sp-xs);
        }
        .close-btn {
          position: absolute;
          top: var(--sp-sm);
          right: var(--sp-sm);
          width: 30px;
          height: 30px;
          border-radius: var(--radius-full);
          background: rgba(218,18,26,0.7);
          color: #fff;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid rgba(255,215,0,0.3);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .close-btn:hover {
          background: var(--danger);
          color: #fff;
          transform: scale(1.15);
        }
        .modal-actions {
          display: flex;
          gap: var(--sp-sm);
        }
        .btn {
          flex: 1;
          padding: var(--sp-md);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
        }
        .btn-primary {
          background: linear-gradient(135deg, #FFD700, #E6C200);
          color: #000;
          border: 1px solid rgba(255,215,0,0.4);
          box-shadow: 0 0 12px rgba(255,215,0,0.3);
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #FFE44D, #FFD700);
          box-shadow: 0 0 16px rgba(255,215,0,0.5);
        }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #f5f0e0;
          border: 1px solid rgba(255,215,0,0.2);
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
