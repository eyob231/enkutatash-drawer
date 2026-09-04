import { useRef, useCallback, useState, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { StampBar } from './components/StampBar';
import { GiftModal } from './components/GiftModal';
import { TipModal } from './components/TipModal';
import { useCanvas } from './hooks/useCanvas';
import { useTelegram } from './hooks/useTelegram';
import type { Stamp } from './utils/stamps';

const BOT_API_URL = 'https://enkutatash-drawer.onrender.com';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGift, setShowGift] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const { toggleMainButton, hideMainButton, toggleBackButton, showAlert, user } = useTelegram();

  const {
    drawState,
    setDrawState,
    canUndo,
    canRedo,
    canvasReady,
    initCanvas,
    undo,
    redo,
    clearCanvas,
    getCanvasImage,
  } = useCanvas(canvasRef);

  // Set up Telegram Main Button
  useEffect(() => {
    if (canvasReady) {
      toggleMainButton('🎁 ስጦታ ላክ', () => {
        const img = getCanvasImage();
        if (img) {
          setCapturedImage(img);
          setShowGift(true);
        }
      });
    }
    
    return () => {
      hideMainButton();
    };
  }, [canvasReady, toggleMainButton, hideMainButton, getCanvasImage]);

  // Set up Back Button for modals
  useEffect(() => {
    if (showGift || showTip) {
      toggleBackButton(true, () => {
        setShowGift(false);
        setShowTip(false);
      });
    } else {
      toggleBackButton(false);
    }
  }, [showGift, showTip, toggleBackButton]);

  const handleStampSelect = useCallback((stamp: Stamp) => {
    setDrawState((prev) => ({ ...prev, activeStamp: stamp, tool: 'stamp' }));
  }, [setDrawState]);

  const handleOpenGift = useCallback(() => {
    const img = getCanvasImage();
    if (img) {
      setCapturedImage(img);
      setShowGift(true);
    }
  }, [getCanvasImage]);

  const downloadImage = useCallback((imageData: string) => {
    const link = document.createElement('a');
    link.download = 'enkutatash-greeting.png';
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleSaveImage = useCallback(() => {
    if (!capturedImage) return;
    downloadImage(capturedImage);
  }, [capturedImage, downloadImage]);

  const handleSendGift = useCallback(async (recipientId: string, image: string) => {
    // Send image to backend API which forwards via Telegram Bot
    const response = await fetch(`${BOT_API_URL}/api/send-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId: recipientId,
        imageData: image,
        caption: '🌸 እንኳን በደመር ደህና መጡ!',
        senderName: user?.first_name || ' Arkadaş',
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'መላክ አልተቻለም');
    }
    
    setShowGift(false);
  }, [user]);

  const handleTipPay = useCallback((amount: number, method: string) => {
    const txRef = `enkutatash-${Date.now()}`;
    console.log('Initiating Chapa payment:', { amount, method, txRef });
    
    showAlert(`💐 አመሰግናለሁ!\n\n${amount} ብር ተከፍሏል በ ${method}.\n\nTx Ref: ${txRef}`);
    setShowTip(false);
  }, [showAlert]);

  const displayName = user ? user.first_name : 'ተቋም';

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <span className="app-icon">🌸</span>
          <div>
            <h1>እንኳን በደመር ደህና መጡ</h1>
            <span className="subtitle">አበቦችን ይ ጀምረው ስጦታ ይላኩ 🇪🇹</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={undo} disabled={!canUndo} title="ተመላሽ">↩️</button>
          <button className="header-btn" onClick={redo} disabled={!canRedo} title="እንደገና">↪️</button>
          <button className="header-btn tip-btn" onClick={() => setShowTip(true)} title="ስጦታ ላክ">
            💐
          </button>
        </div>
      </header>

      {/* Canvas */}
      <Canvas canvasRef={canvasRef} onReady={initCanvas} />

      {/* Stamp Bar */}
      <StampBar
        activeStamp={drawState.activeStamp}
        onStampSelect={handleStampSelect}
        onToolChange={(tool) => setDrawState((prev) => ({ ...prev, tool }))}
      />

      {/* Toolbar */}
      <Toolbar
        tool={drawState.tool}
        color={drawState.color}
        brushSize={drawState.brushSize}
        onToolChange={(tool) => setDrawState((prev) => ({ ...prev, tool }))}
        onColorChange={(color) => setDrawState((prev) => ({ ...prev, color }))}
        onBrushSizeChange={(brushSize) => setDrawState((prev) => ({ ...prev, brushSize }))}
        onClear={clearCanvas}
      />

      {/* Bottom Actions */}
      <div className="bottom-bar">
        <button className="btn btn-secondary" onClick={handleSaveImage} disabled={!canvasReady}>
          💾 አስቀምጥ
        </button>
        <button className="btn btn-primary" onClick={handleOpenGift} disabled={!canvasReady}>
          🎁 ስጦታ ላክ
        </button>
      </div>

      {/* Modals */}
      <GiftModal
        isOpen={showGift}
        image={capturedImage}
        onClose={() => setShowGift(false)}
        onSend={handleSendGift}
        onSave={handleSaveImage}
      />
      <TipModal
        isOpen={showTip}
        artistName={displayName}
        onClose={() => setShowTip(false)}
        onPay={handleTipPay}
      />

      <style>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }

        /* Header */
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sp-sm) var(--sp-md);
          background: linear-gradient(180deg, #1a1500 0%, #0d0d1a 100%);
          flex-shrink: 0;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
        }
        .app-icon {
          font-size: 28px;
          filter: drop-shadow(0 0 6px var(--meskel-yellow));
        }
        .app-header h1 {
          font-size: 15px;
          font-weight: 700;
          color: var(--meskel-yellow);
          text-shadow: 0 0 8px rgba(255,215,0,0.5);
          line-height: 1.2;
        }
        .subtitle {
          font-size: 11px;
          color: var(--text-muted);
        }
        .header-actions {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: var(--sp-xs);
        }
        .header-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          background: rgba(255,215,0,0.1);
          color: var(--meskel-yellow);
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,215,0,0.2);
        }
        .header-btn:hover:not(:disabled) {
          background: rgba(255,215,0,0.25);
          transform: scale(1.1);
        }
        .header-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .tip-btn {
          width: 36px;
          height: 36px;
          font-size: 18px;
        }

        /* Bottom Bar */
        .bottom-bar {
          display: flex;
          gap: var(--sp-sm);
          padding: var(--sp-sm) var(--sp-md);
          background: linear-gradient(180deg, #1a1500 0%, #0d0d1a 100%);
          flex-shrink: 0;
        }
        .bottom-bar .btn {
          flex: 1;
          padding: var(--sp-md);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
        }
        .bottom-bar .btn-primary {
          background: linear-gradient(135deg, #FFD700, #E6C200);
          color: #000;
          border: 1px solid rgba(255,215,0,0.4);
          box-shadow: 0 0 12px rgba(255,215,0,0.3);
        }
        .bottom-bar .btn-primary:hover {
          background: linear-gradient(135deg, #FFE44D, #FFD700);
          box-shadow: 0 0 16px rgba(255,215,0,0.5);
        }
        .bottom-bar .btn-secondary {
          background: rgba(255,255,255,0.08);
          color: #f5f0e0;
          border: 1px solid rgba(255,215,0,0.2);
        }
        .bottom-bar .btn-secondary:hover {
          background: rgba(255,255,255,0.15);
        }
        .bottom-bar .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default App;
