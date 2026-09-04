import { useState } from 'react';

interface TipModalProps {
  isOpen: boolean;
  artistName: string;
  onClose: () => void;
  onPay: (amount: number, method: string) => void;
}

const PRESET_AMOUNTS = [50, 100, 200, 500];
const PAYMENT_METHODS = [
  { id: 'telebirr', name: 'TeleBirr', icon: '📱' },
  { id: 'cbe', name: 'CBE Birr', icon: '🏦' },
  { id: 'amole', name: 'Amole', icon: '💳' },
  { id: 'chapa', name: 'Chapa (All)', icon: '🌐' },
];

export function TipModal({ isOpen, artistName, onClose, onPay }: TipModalProps) {
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('chapa');

  if (!isOpen) return null;

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount;

  const handlePay = () => {
    if (finalAmount > 0) {
      onPay(finalAmount, method);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tip-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2>💐 Send a Tip</h2>
        <p className="tip-to">Send love to <strong>{artistName}</strong></p>

        {/* Amount Selection */}
        <div className="amount-section">
          <label>Amount (ETB)</label>
          <div className="preset-amounts">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                className={`amount-btn ${amount === a && !customAmount ? 'active' : ''}`}
                onClick={() => { setAmount(a); setCustomAmount(''); }}
              >
                {a} Br
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="custom-amount"
            min="1"
          />
        </div>

        {/* Payment Method */}
        <div className="method-section">
          <label>Pay with</label>
          <div className="methods">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                className={`method-btn ${method === m.id ? 'active' : ''}`}
                onClick={() => setMethod(m.id)}
              >
                <span className="method-icon">{m.icon}</span>
                <span className="method-name">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          className="btn btn-primary pay-btn"
          onClick={handlePay}
          disabled={finalAmount <= 0}
        >
          💳 Pay {finalAmount} ETB via Chapa
        </button>

        <p className="chapa-note">
          🔒 Powered by <strong>Chapa</strong> — secure Ethiopian payment gateway
        </p>

        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <style>{`
        .tip-modal {
          max-width: 380px;
        }
        .tip-to {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: var(--sp-lg);
        }
        .amount-section,
        .method-section {
          text-align: left;
          margin-bottom: var(--sp-lg);
        }
        .amount-section label,
        .method-section label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: var(--sp-sm);
        }
        .preset-amounts {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--sp-xs);
          margin-bottom: var(--sp-sm);
        }
        .amount-btn {
          padding: var(--sp-sm) var(--sp-xs);
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.08);
          color: var(--text-light);
          font-size: 13px;
          font-weight: 600;
        }
        .amount-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        .amount-btn.active {
          background: linear-gradient(135deg, #FFD700, #E6C200);
          color: #000;
          box-shadow: 0 0 12px rgba(255,215,0,0.4);
        }
        .custom-amount {
          width: 100%;
          padding: var(--sp-sm) var(--sp-md);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--text-light);
          font-size: 14px;
          outline: none;
        }
        .custom-amount:focus {
          border-color: var(--accent);
        }
        .methods {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--sp-sm);
        }
        .method-btn {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          padding: var(--sp-sm) var(--sp-md);
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.08);
          color: var(--text-light);
          font-size: 13px;
        }
        .method-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        .method-btn.active {
          background: rgba(255,215,0,0.35);
          border: 1px solid var(--meskel-yellow);
          color: var(--meskel-yellow);
        }
        .method-icon {
          font-size: 18px;
        }
        .pay-btn {
          width: 100%;
          margin-top: var(--sp-md);
          font-size: 16px;
          padding: 14px;
          background: linear-gradient(135deg, #FFD700, #E6C200);
          color: #000;
          border: 1px solid rgba(255,215,0,0.4);
          box-shadow: 0 0 16px rgba(255,215,0,0.4);
        }
        .pay-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chapa-note {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: var(--sp-md);
          border-top: 1px solid rgba(255,215,0,0.15);
          padding-top: var(--sp-sm);
        }
        .close-btn {
          position: sticky;
          top: 0;
          right: 0;
          z-index: 10;
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
          margin-top: calc(-1 * var(--sp-md));
          margin-right: var(--sp-sm);
          border: 1px solid rgba(255,215,0,0.3);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
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
