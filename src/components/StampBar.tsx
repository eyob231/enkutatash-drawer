import { FLOWER_STAMPS } from '../utils/stamps';
import type { Stamp } from '../utils/stamps';
import type { Tool } from '../hooks/useCanvas';

interface StampBarProps {
  activeStamp: Stamp | null;
  onStampSelect: (stamp: Stamp) => void;
  onToolChange: (tool: Tool) => void;
}

export function StampBar({ activeStamp, onStampSelect, onToolChange }: StampBarProps) {
  return (
    <div className="stamp-bar">
      <span className="stamp-label">🌸 Flowers</span>
      <div className="stamp-list">
        {FLOWER_STAMPS.map((stamp) => (
          <button
            key={stamp.id}
            className={`stamp-btn ${activeStamp?.id === stamp.id ? 'active' : ''}`}
            onClick={() => {
              onStampSelect(stamp);
              onToolChange('stamp');
            }}
            title={stamp.name}
            dangerouslySetInnerHTML={{ __html: stamp.svg }}
          />
        ))}
      </div>
      <style>{`
        .stamp-bar {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          padding: var(--sp-sm) var(--sp-md);
          background: linear-gradient(180deg, #1a1500 0%, #0d0d1a 100%);
          border-radius: var(--radius-md);
          margin: 0 var(--sp-sm) var(--sp-sm);
          overflow-x: auto;
          overflow-y: hidden;
          flex-shrink: 0;
        }
        .stamp-label {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .stamp-list {
          display: flex;
          gap: var(--sp-xs);
        }
        .stamp-btn {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 4px;
        }
        .stamp-btn svg {
          width: 100%;
          height: 100%;
        }
        .stamp-btn:hover {
          background: rgba(255,255,255,0.12);
        }
        .stamp-btn.active {
          background: var(--accent);
          box-shadow: 0 0 8px rgba(255,215,0,0.4);
        }
      `}</style>
    </div>
  );
}
