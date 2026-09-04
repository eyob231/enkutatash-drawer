import { useState, useEffect } from 'react';

interface GiftModalProps {
  isOpen: boolean;
  image: string | null;
  onClose: () => void;
  onSend: (recipientId: string, image: string) => void;
  onSave: () => void;
}

const RECIPIENT_KEY = 'enkutatash_recipient';

export function GiftModal({ isOpen, image, onClose, onSend, onSave }: GiftModalProps) {
  const [recipientId, setRecipientId] = useState('');
  const [step, setStep] = useState<'preview' | 'recipient' | 'sending' | 'done'>('preview');
  const [savedRecipient, setSavedRecipient] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(RECIPIENT_KEY);
    if (saved) setSavedRecipient(saved);
  }, []);

  if (!isOpen || !image) return null;

  const handleContinue = () => {
    if (savedRecipient) {
      setStep('sending');
      handleAutoSend(savedRecipient);
    } else {
      setStep('recipient');
    }
  };

  const handleRecipientSubmit = () => {
    if (recipientId.trim()) {
      localStorage.setItem(RECIPIENT_KEY, recipientId.trim());
      setSavedRecipient(recipientId.trim());
      setStep('sending');
      handleAutoSend(recipientId.trim());
    }
  };

  const handleAutoSend = async (targetId: string) => {
    setError('');
    try {
      await onSend(targetId, image);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'መላክ አልተቻለም');
      setStep('recipient');
    }
  };

  const handleClose = () => {
    setStep('preview');
    setRecipientId('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content gift-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>✕</button>
        
        {step === 'preview' && (
          <>
            <h2>🎁 ስጦታ ላክ</h2>
            <div className="gift-preview">
              <img src={image} alt="የእርስዎ ቅርዓት" />
            </div>
            <p className="gift-desc">
              የእርስዎ ቅርዓት ለጓደኛዎ በቀጥታ ይላኩ! 🇪🇹
            </p>
            <div className="gift-message">
              <span>መልዕክት: </span>
              <em>"እንኳን በደመር ደህና መጡ! 🌸🌼🌺" </em>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={onSave}>
                💾 አስቀምጥ
              </button>
              <button className="btn btn-primary" onClick={handleContinue}>
                🎁 ላክ
              </button>
            </div>
          </>
        )}

        {step === 'recipient' && (
          <>
            <h2>👤 ማን ላክ?</h2>
            <p className="gift-desc">
              የተቀባዩን Telegram User ID ያስገቡ
            </p>
            <div className="recipient-input-group">
              <input
                type="text"
                placeholder="123456789"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="recipient-input"
              />
              <span className="recipient-hint">ID</span>
            </div>
            {error && <p className="error-text">❌ {error}</p>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setStep('preview')}>
                ↩️ ተመለስ
              </button>
              <button className="btn btn-primary" onClick={handleRecipientSubmit} disabled={!recipientId.trim()}>
                ✅ ላክ
              </button>
            </div>
            <button className="change-recipient-btn" onClick={() => { setSavedRecipient(''); localStorage.removeItem(RECIPIENT_KEY); }}>
              🔄 ቆይተህ ይ enthusiastically ያስገቡ
            </button>
          </>
        )}

        {step === 'sending' && (
          <>
            <h2>📤 በመላክ ላይ...</h2>
            <div className="sending-animation">
              <span className="spinner">🌸</span>
            </div>
            <p className="gift-desc">
              ቅርዓቱ ለ +{savedRecipient} በመላክ ላይ...
            </p>
          </>
        )}

        {step === 'done' && (
          <>
            <h2>✅ ተላክፏል!</h2>
            <div className="gift-preview-small">
              <img src={image} alt="ቅርዓት" />
            </div>
            <p className="gift-desc success-text">
              ቅርዓቱ በተሳካ ሁኔታ ተላክፏል! 🎉
            </p>
            <p className="gift-desc">
              ለ +{savedRecipient} ተል馈ል
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleClose}>
                ✅ ጥሩ
              </button>
            </div>
          </>
        )}
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
          max-height: 90vh;
          overflow-y: auto;
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
        .gift-preview-small {
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: var(--sp-md);
          border: 1px solid rgba(255,215,0,0.3);
          max-height: 120px;
        }
        .gift-preview-small img {
          width: 100%;
          display: block;
          object-fit: cover;
        }
        .gift-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: var(--sp-sm);
        }
        .success-text {
          color: #4CAF50;
          font-weight: 600;
        }
        .error-text {
          color: #f44336;
          font-size: 12px;
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
        .recipient-input-group {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          margin-bottom: var(--sp-lg);
        }
        .recipient-input {
          flex: 1;
          padding: var(--sp-md);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255,215,0,0.3);
          background: rgba(255,255,255,0.05);
          color: var(--text-light);
          font-size: 16px;
          outline: none;
        }
        .recipient-input:focus {
          border-color: var(--meskel-yellow);
          box-shadow: 0 0 8px rgba(255,215,0,0.3);
        }
        .recipient-hint {
          color: var(--text-muted);
          font-size: 14px;
        }
        .sending-animation {
          margin: var(--sp-lg) 0;
        }
        .spinner {
          font-size: 48px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #f5f0e0;
          border: 1px solid rgba(255,215,0,0.2);
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.2);
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
        .change-recipient-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          padding: var(--sp-sm);
          margin-top: var(--sp-sm);
        }
        .change-recipient-btn:hover {
          color: var(--meskel-yellow);
        }
      `}</style>
    </div>
  );
}
