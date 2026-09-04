import type { Tool } from '../hooks/useCanvas';

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Yellow', value: '#FFD700' },
  { name: 'Green', value: '#009A44' },
  { name: 'Red', value: '#DA121A' },
  { name: 'Blue', value: '#4189DD' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Pink', value: '#FF69B4' },
  { name: 'Orange', value: '#FF8C00' },
  { name: 'White', value: '#FFFFFF' },
];

const BRUSH_SIZES = [2, 4, 8, 14];

interface ToolbarProps {
  tool: Tool;
  color: string;
  brushSize: number;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
}

export function Toolbar({
  tool, color, brushSize,
  onToolChange, onColorChange, onBrushSizeChange, onClear,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      {/* Tools */}
      <div className="toolbar-section">
        <button
          className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
          onClick={() => onToolChange('pen')}
          title="Pen"
        >✏️</button>
        <button
          className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => onToolChange('eraser')}
          title="Eraser"
        >🧹</button>
      </div>

      {/* Colors */}
      <div className="toolbar-section colors">
        {COLORS.map((c) => (
          <button
            key={c.value}
            className={`color-btn ${color === c.value ? 'active' : ''}`}
            style={{ background: c.value }}
            onClick={() => { onColorChange(c.value); onToolChange('pen'); }}
            title={c.name}
          />
        ))}
      </div>

      {/* Brush Size */}
      <div className="toolbar-section brushes">
        {BRUSH_SIZES.map((s) => (
          <button
            key={s}
            className={`brush-btn ${brushSize === s ? 'active' : ''}`}
            onClick={() => onBrushSizeChange(s)}
            title={`Size ${s}`}
          >
            <span className="brush-dot" style={{ width: s + 2, height: s + 2 }} />
          </button>
        ))}
      </div>

      {/* Clear */}
      <div className="toolbar-section">
        <button
          className="tool-btn danger"
          onClick={onClear}
          title="Clear canvas"
        >🗑️</button>
      </div>

      <style>{`
        .toolbar {
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
        .toolbar-section {
          display: flex;
          align-items: center;
          gap: var(--sp-xs);
          flex-shrink: 0;
        }
        .toolbar-section.colors {
          gap: 3px;
        }
        .tool-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.08);
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tool-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.15);
        }
        .tool-btn.active {
          background: var(--accent);
          color: #000;
        }
        .tool-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .tool-btn.danger:hover:not(:disabled) {
          background: var(--danger);
          color: #fff;
        }
        .color-btn {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          border: 2px solid rgba(255,215,0,0.3);
          flex-shrink: 0;
        }
        .color-btn.active {
          border-color: var(--meskel-yellow);
          box-shadow: 0 0 0 3px var(--meskel-yellow), 0 0 12px rgba(255,215,0,0.5);
        }
        .brush-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: rgba(255,215,0,0.15);
          border: 1px solid rgba(255,215,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .brush-btn.active {
          background: rgba(255,215,0,0.4);
          border-color: var(--meskel-yellow);
        }
        .brush-dot {
          border-radius: var(--radius-full);
          background: var(--text-light);
          display: block;
        }
      `}</style>
    </div>
  );
}
