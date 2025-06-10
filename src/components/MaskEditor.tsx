//components/MaskEditor.tsx

"use client";

import { useEffect, useRef, useState } from "react";

interface MaskEditorProps {
  imageUrl: string;
  canvasSize: number;
  onMaskChange: (maskBlob: Blob) => void;
}

export default function MaskEditor({
  imageUrl,
  canvasSize,
  onMaskChange,
}: MaskEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    c.width = canvasSize;
    c.height = canvasSize;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    updatePreview();
  }, [canvasSize, imageUrl]);

  function getPos(e: MouseEvent | TouchEvent) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    let x = 0, y = 0;
    if ("touches" in e && e.touches[0]) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else if ("clientX" in e) {
      x = e.clientX;
      y = e.clientY;
    }
    return {
      x: ((x - rect.left) / rect.width) * canvasSize,
      y: ((y - rect.top) / rect.height) * canvasSize,
    };
  }

  function pointerDown(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    setIsDrawing(true);
    draw(e as any);
  }

  function pointerMove(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (!isDrawing) return;
    draw(e as any);
  }

  function pointerUp() {
    setIsDrawing(false);
    updatePreview();
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | MouseEvent | TouchEvent) {
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e as any);
    ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function handleClear() {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.globalCompositeOperation = "source-over";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    updatePreview();
  }

  function updatePreview() {
    const maskCanvas = canvasRef.current!;
    const temp = document.createElement("canvas");
    temp.width = canvasSize;
    temp.height = canvasSize;
    const ctx = temp.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
      ctx.globalAlpha = 0.45;
      ctx.drawImage(maskCanvas, 0, 0, canvasSize, canvasSize);
      setPreviewUrl(temp.toDataURL());
    };
  }

  function handleExportMask() {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const imgData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i] === 255) {
        imgData.data[i + 3] = 0;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    c.toBlob((b) => {
      if (b) onMaskChange(b);
    }, "image/png");
  }

  // eventos mouse + touch
  useEffect(() => {
    const c = canvasRef.current!;
    c.addEventListener("mousedown", pointerDown);
    c.addEventListener("mousemove", pointerMove);
    window.addEventListener("mouseup", pointerUp);
    c.addEventListener("touchstart", pointerDown);
    c.addEventListener("touchmove", pointerMove);
    window.addEventListener("touchend", pointerUp);
    c.style.touchAction = "none";
    return () => {
      c.removeEventListener("mousedown", pointerDown);
      c.removeEventListener("mousemove", pointerMove);
      window.removeEventListener("mouseup", pointerUp);
      c.removeEventListener("touchstart", pointerDown);
      c.removeEventListener("touchmove", pointerMove);
      window.removeEventListener("touchend", pointerUp);
    };
  }, [isDrawing, isErasing]);

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: "relative", width: canvasSize, height: canvasSize, marginBottom: 12 }}>
        <img
          src={previewUrl || imageUrl}
          alt="Máscara sobre a imagem"
          style={{
            width: canvasSize,
            height: canvasSize,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: canvasSize,
            height: canvasSize,
            cursor: isErasing ? "cell" : "crosshair",
            zIndex: 2,
            background: "transparent",
          }}
        />
      </div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleExportMask}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Usar Máscara Atual
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Limpar Máscara
        </button>
        <button
          onClick={() => setIsErasing((e) => !e)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          {isErasing ? "Modo Pintura" : "Modo Borracha"}
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        📱 <b>Toque</b> e arraste para pintar em branco (áreas que serão alteradas).<br />
        No modo borracha, apague partes da máscara (apaga o branco).<br />
        Use o botão acima para alternar entre pintar e apagar.<br />
        Depois, clique em <b>Usar Máscara Atual</b> para enviar à IA.
      </p>
    </div>
  );
}
