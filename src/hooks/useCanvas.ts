import { useRef, useState, useCallback, useEffect } from 'react';
import type { Stamp } from '../utils/stamps';

export type Tool = 'pen' | 'eraser' | 'stamp';

interface DrawState {
  tool: Tool;
  color: string;
  brushSize: number;
  activeStamp: Stamp | null;
}

interface HistoryEntry {
  imageData: ImageData;
}

const MAX_HISTORY = 50;

export function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const history = useRef<HistoryEntry[]>([]);
  const historyIndex = useRef(-1);
  const stampPreviewPos = useRef<{ x: number; y: number } | null>(null);

  const [drawState, setDrawState] = useState<DrawState>({
    tool: 'pen',
    color: '#FFD700',
    brushSize: 4,
    activeStamp: null,
  });

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const getCanvas = useCallback(() => canvasRef.current, [canvasRef]);

  const getPos = useCallback((e: MouseEvent | Touch) => {
    const canvas = getCanvas();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [getCanvas]);

  const saveState = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trim future history
    history.current = history.current.slice(0, historyIndex.current + 1);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.current.push({ imageData });

    if (history.current.length > MAX_HISTORY) {
      history.current.shift();
    }
    historyIndex.current = history.current.length - 1;

    setCanUndo(historyIndex.current > 0);
    setCanRedo(false);
  }, [getCanvas]);

  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return;
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyIndex.current--;
    ctx.putImageData(history.current[historyIndex.current].imageData, 0, 0);

    setCanUndo(historyIndex.current > 0);
    setCanRedo(true);
  }, [getCanvas]);

  const redo = useCallback(() => {
    if (historyIndex.current >= history.current.length - 1) return;
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyIndex.current++;
    ctx.putImageData(history.current[historyIndex.current].imageData, 0, 0);

    setCanUndo(true);
    setCanRedo(historyIndex.current < history.current.length - 1);
  }, [getCanvas]);

  const clearCanvas = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, [getCanvas, saveState]);

  const initCanvas = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Fill with white background (painted canvas look)
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Subtle paper texture via random stippling
    ctx.fillStyle = 'rgba(255,235,200,0.3)';
    for (let i = 0; i < rect.width * rect.height * 0.03; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      ctx.fillRect(x, y, 1, 1);
    }

    saveState();
    setCanvasReady(true);
  }, [getCanvas, saveState]);

  const drawLine = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    if (drawState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#FFFDF5';
      ctx.lineWidth = drawState.brushSize * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawState.color;
      ctx.lineWidth = drawState.brushSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [getCanvas, drawState]);

  const placeStamp = useCallback((x: number, y: number) => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const stamp = drawState.activeStamp;
    if (!stamp) return;

    const img = new Image();
    const blob = new Blob([stamp.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, x - stamp.size / 2, y - stamp.size / 2, stamp.size, stamp.size);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [getCanvas, drawState.activeStamp]);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const pos = 'touches' in e ? getPos(e.touches[0]) : getPos(e);
    isDrawing.current = true;
    lastPos.current = pos;

    if (drawState.tool === 'stamp' && drawState.activeStamp) {
      placeStamp(pos.x, pos.y);
      saveState();
      isDrawing.current = false;
    }
  }, [getPos, drawState, placeStamp, saveState]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current || drawState.tool === 'stamp') return;

    const pos = 'touches' in e ? getPos(e.touches[0]) : getPos(e);
    drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    lastPos.current = pos;
  }, [getPos, drawLine, drawState.tool]);

  const stopDrawing = useCallback((e?: MouseEvent | TouchEvent) => {
    if (e) e.preventDefault();
    if (isDrawing.current) {
      isDrawing.current = false;
      if (drawState.tool !== 'stamp') {
        saveState();
      }
    }
  }, [saveState, drawState.tool]);

  const getCanvasImage = useCallback((): string | null => {
    const canvas = getCanvas();
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, [getCanvas]);

  // Attach event listeners
  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = (e: MouseEvent) => stopDrawing(e);
    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = (e: TouchEvent) => stopDrawing(e);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [getCanvas, startDrawing, draw, stopDrawing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
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
  };
}
