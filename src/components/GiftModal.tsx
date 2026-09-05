import { useState } from 'react';

interface GiftModalProps {
  isOpen: boolean;
  image: string | null;
  onClose: () => void;
  onSend: (image: string) => void;
  onSave: () => void;
  onSendByUsername?: (image: string, username: string) => Promise<void>;
}

export function GiftModal({ isOpen, image, onClose, onSend, onSave, onSendByUsername }: GiftModalProps) {
  const [step, setStep] = useState<'preview' | 'sending' | 'done' | 'username'>('preview');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  if (!isOpen || !image) return null;

  const handlePickContact = async () => {
    setStep('sending');
    setError('');
    try {
      await onSend(image);
      // If onSend succeeds without throwing, the contact picker opened
    } catch (err: any) {
      // switchInlineQuery failed — show username input as fallback
      console.log('switchInlineQuery failed, showing username input');
      setStep('username');
    }
  };

  const handleUsernameSend = async () => {
    if (!username.trim()) return;
    setStep('sending');
    setError('');
    try {
      if (onSendByUsername) {
        await onSendByUsername(image, username.trim());
      }
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'መላክ አልተቻለም');
      setStep('username');
    }
  };

  const handleClose = () => {
    setStep('preview');
    setUsername('');
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
              <button className="btn btn-primary" onClick={handlePickContact}>
                📤 ማን ላክ?
              </button>
            </div>
          </>
        )}

        {step === 'username' && (
          <>
            <h2>👤 የተቀባይ ያስገቡ</h2>
            <p className="gift-desc">
              የተቀባዩን Telegram username ያስገቡ
            </p>
            <div className="username-input-group">
              <span className="at-sign">@</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                className="username-input"
                autoFocus
              />
            </div>
            {error && <p className="error-text">❌ {error}</p>}
            <p className="gift-desc small">
              💡 ተቀባይ በቅድሚያ Bot ላይ /start እንዲያደርግ ያስገብጉ!
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setStep('preview')}>
                ↩️ ተመለስ
              </button>
              <button className="btn btn-primary" onClick={handleUsernameSend} disabled={!username.trim()}>
                📤 ላክ
              </button>
            </div>
          </>
        )}

        {step === 'sending' && (
          <>
            <h2>📤 በመላክ ላይ...</h2>
            <div className="sending-animation">
              <span className="spinner">🌸</span>
            </div>
            <p className="gift-desc">
              ቅርዓቱ በመ硭ተት ላይ...
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
        .gift-desc.small {
          font-size: 11px;
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
        .username-input-group {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          margin-bottom: var(--sp-md);
          background: rgba(255,255,255,0.05);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255,215,0,0.3);
          padding: var(--sp-sm) var(--sp-md);
        }
        .username-input-group:focus-within {
          border-color: var(--meskel-yellow);
          box-shadow: 0 0 8px rgba(255,215,0,0.3);
        }
        .at-sign {
          color: var(--meskel-yellow);
          font-size: 16px;
          font-weight: 600;
        }
        .username-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-light);
          font-size: 16px;
          outline: none;
          padding: var(--sp-sm) 0;
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
          z-index: 10;
        }
        .close-btn:hover {
          background: var(--danger);
          color: #fff;
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}
