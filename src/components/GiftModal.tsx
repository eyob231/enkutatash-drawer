import { useState, useEffect } from 'react';

interface GiftModalProps {
  isOpen: boolean;
  image: string | null;
  onClose: () => void;
  onSend: (phone: string) => void;
  onSave: () => void;
}

const PHONE_KEY = 'enkutatash_phone';

export function GiftModal({ isOpen, image, onClose, onSend, onSave }: GiftModalProps) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'preview' | 'phone' | 'share'>('preview');
  const [savedPhone, setSavedPhone] = useState('');

  // Load saved phone from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(PHONE_KEY);
    if (saved) {
      setSavedPhone(saved);
    }
  }, []);

  if (!isOpen || !image) return null;

  const handleContinue = () => {
    if (savedPhone) {
      // User has saved phone, go directly to share
      setStep('share');
    } else {
      // No saved phone, ask for it
      setStep('phone');
    }
  };

  const handlePhoneSubmit = () => {
    if (phone.length >= 10) {
      // Save to localStorage
      localStorage.setItem(PHONE_KEY, phone);
      setSavedPhone(phone);
      setStep('share');
    }
  };

  const handleChangePhone = () => {
    setPhone(savedPhone);
    setStep('phone');
  };

  const handleShare = () => {
    onSend(savedPhone || phone);
  };

  const handleClose = () => {
    setStep('preview');
    setPhone('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content gift-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>✕</button>
        
        {step === 'preview' && (
          <>
            <h2>🎁 እንኳን በደመር ስጦታ ላክ</h2>
            <div className="gift-preview">
              <img src={image} alt="የእርስዎ ቅርዓት" />
            </div>
            <p className="gift-desc">
              የእርስዎ የአበብ ቅርዓት ለጓደኛዎ ይላኩ! 🇪🇹
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
                🎁 ቀጥል
              </button>
            </div>
          </>
        )}

        {step === 'phone' && (
          <>
            <h2>📱 የቴሌብር ቁጥር ያስገቡ</h2>
            <p className="gift-desc">
              ለስጦታ የቴሌብር ቁጥር ያስገቡ
            </p>
            <div className="phone-input-group">
              <input
                type="tel"
                placeholder="09XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="phone-input"
                maxLength={10}
              />
              <span className="phone-hint">+251</span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setStep('preview')}>
                ↩️ ተመለስ
              </button>
              <button className="btn btn-primary" onClick={handlePhoneSubmit} disabled={phone.length < 10}>
                ✅ ቀጥል
              </button>
            </div>
          </>
        )}

        {step === 'share' && (
          <>
            <h2>📤 ለማካፈል ይምረጡ</h2>
            <div className="saved-phone">
              <span className="phone-label">የ ቴሌብር ቁጥር:</span>
              <span className="phone-number">+251 {savedPhone || phone}</span>
            </div>
            <p className="gift-desc">
              ቅርዓቱን ለማካፈል ይምረጡ
            </p>
            <div className="share-buttons">
              <button className="share-btn telegram" onClick={handleShare}>
                📱 Telegram ላክ
              </button>
              <button className="share-btn copy" onClick={() => {
                navigator.clipboard?.writeText(`+251${savedPhone || phone}`);
                alert('📞 ቁጥር ተቋቁሟል!');
              }}>
                📋 ቁጥር ቋጥር
              </button>
            </div>
            <button className="change-phone-btn" onClick={handleChangePhone}>
              📱 ቁጥር ቀይበር
            </button>
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
        .phone-input-group {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          margin-bottom: var(--sp-lg);
        }
        .phone-input {
          flex: 1;
          padding: var(--sp-md);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255,215,0,0.3);
          background: rgba(255,255,255,0.05);
          color: var(--text-light);
          font-size: 16px;
          outline: none;
        }
        .phone-input:focus {
          border-color: var(--meskel-yellow);
          box-shadow: 0 0 8px rgba(255,215,0,0.3);
        }
        .phone-hint {
          color: var(--text-muted);
          font-size: 14px;
        }
        .saved-phone {
          background: rgba(255,215,0,0.1);
          padding: var(--sp-md);
          border-radius: var(--radius-sm);
          margin-bottom: var(--sp-md);
        }
        .phone-label {
          font-size: 12px;
          color: var(--text-muted);
          display: block;
          margin-bottom: var(--sp-xs);
        }
        .phone-number {
          font-size: 18px;
          color: var(--meskel-yellow);
          font-weight: 600;
        }
        .share-buttons {
          display: flex;
          gap: var(--sp-sm);
          margin-bottom: var(--sp-md);
        }
        .share-btn {
          flex: 1;
          padding: var(--sp-md);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .share-btn.telegram {
          background: linear-gradient(135deg, #0088cc, #0066aa);
          color: #fff;
        }
        .share-btn.telegram:hover {
          background: linear-gradient(135deg, #0099dd, #0077bb);
        }
        .share-btn.copy {
          background: rgba(255,255,255,0.1);
          color: var(--text-light);
          border: 1px solid rgba(255,215,0,0.2);
        }
        .share-btn.copy:hover {
          background: rgba(255,255,255,0.2);
        }
        .change-phone-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          padding: var(--sp-sm);
        }
        .change-phone-btn:hover {
          color: var(--meskel-yellow);
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
      `}</style>
    </div>
  );
}
