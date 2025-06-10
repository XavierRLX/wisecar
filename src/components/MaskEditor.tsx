// components/MaskEditor.tsx
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

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }, [canvasSize]);

  function handleMouseDown(e: React.MouseEvent) {
    setIsDrawing(true);
    draw(e);
  }

  function handleMouseUp() {
    setIsDrawing(false);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDrawing) return;
    draw(e);
  }

  function draw(e: React.MouseEvent) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasSize;
    const y = ((e.clientY - rect.top) / rect.height) * canvasSize;

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function handleExportMask() {
    const canvas = canvasRef.current!;
    canvas.toBlob((blob) => {
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
          marginBottom: 8,
        }}
      >
        <img
          src={imageUrl}
          alt="Preview do carro"
          style={{
            width: canvasSize,
            height: canvasSize,
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            cursor: "crosshair",
            zIndex: 1,
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <button
        onClick={handleExportMask}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Usar Máscara Atual
      </button>
      <p className="text-xs text-gray-500 mt-1 text-center">
        Rabisque em branco as áreas que deseja editar; em preto, as que devem
        permanecer inalteradas. Depois clique em “Usar Máscara Atual”.
      </p>
    </div>
  );
}
