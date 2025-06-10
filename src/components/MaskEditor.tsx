"use client";

import { useEffect, useRef, useState } from "react";

interface MaskEditorProps {
  imageUrl: string;
  canvasSize: number; // ex: 256
  onMaskChange: (maskBlob: Blob) => void;
}

export default function MaskEditor({
  imageUrl,
  canvasSize,
  onMaskChange,
}: MaskEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<"white" | "black">("white");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Inicializa máscara preta (tudo preservado)
  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    updatePreview();
    // eslint-disable-next-line
  }, [canvasSize, imageUrl]);

  function getCursorPos(
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ): { x: number; y: number } {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasSize,
      y: ((e.clientY - rect.top) / rect.height) * canvasSize,
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    setDrawMode(e.ctrlKey || e.metaKey ? "black" : "white");
    draw(e);
  }
  function handleMouseUp() {
    setIsDrawing(false);
    updatePreview();
  }
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    setDrawMode(e.ctrlKey || e.metaKey ? "black" : "white");
    draw(e);
  }
  function handleMouseLeave() {
    setIsDrawing(false);
    updatePreview();
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getCursorPos(e);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = drawMode === "white" ? "white" : "black";
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    updatePreview();
  }

  function handleClear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    updatePreview();
  }

  function updatePreview() {
    const maskCanvas = canvasRef.current!;
    const temp = document.createElement("canvas");
    temp.width = canvasSize;
    temp.height = canvasSize;
    const ctx = temp.getContext("2d")!;
    const baseImg = new window.Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = imageUrl;
    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, canvasSize, canvasSize);
      ctx.globalAlpha = 0.45;
      ctx.drawImage(maskCanvas, 0, 0, canvasSize, canvasSize);
      ctx.globalAlpha = 1.0;
      setPreviewUrl(temp.toDataURL());
    };
  }

  function handleExportMask() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imgData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const isWhite = imgData.data[i] === 255;
      if (isWhite) imgData.data[i+3] = 0; // alpha = 0 (transparente)
    }
    ctx.putImageData(imgData, 0, 0);
    canvas.toBlob(blob => {
      if (blob) onMaskChange(blob);
    }, "image/png");
  }
  

  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          position: "relative",
          width: canvasSize,
          height: canvasSize,
          marginBottom: 12,
        }}
      >
        <img
          src={previewUrl || imageUrl}
          alt="Máscara sobre a imagem"
          style={{
            width: canvasSize,
            height: canvasSize,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            display: "block",
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            top: 0,
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
            cursor: "crosshair",
            zIndex: 2,
            background: "transparent",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleExportMask}
        >
          Usar Máscara Atual
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={handleClear}
        >
          Limpar Máscara
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Rabisque em <span className="font-bold">branco</span> as áreas que deseja editar.<br />
        Mantenha <span className="font-bold">preto</span> as que devem permanecer inalteradas.<br />
        <span className="italic">Segure <b>Ctrl</b> ou <b>Command</b> para apagar (desenhar preto).</span>
      </p>
    </div>
  );
}
