import { useRef, useEffect } from 'react';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onReady: () => void;
}

export function Canvas({ canvasRef, onReady }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas ref={canvasRef} />
      <style>{`
        .canvas-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #FFFDF5;
          border-radius: var(--radius-md);
          margin: var(--sp-sm);
        }
        .canvas-container canvas {
          display: block;
          width: 100%;
          height: 100%;
          touch-action: none;
          cursor: crosshair;
        }
      `}</style>
    </div>
  );
}
