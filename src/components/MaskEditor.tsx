"use client";

import { useEffect, useRef, useState } from "react";

interface MaskEditorProps {
  imageUrl: string;
  canvasSize: number;            // ex.: 256 (mesma resolução que será enviada)
  onMaskChange: (maskBlob: Blob) => void;
}

export default function MaskEditor({
  imageUrl,
  canvasSize,
  onMaskChange,
}: MaskEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 1) Inicializa o canvas preenchendo tudo de preto
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }, [canvasSize]);

  // 2) Ao pressionar mouse, inicia desenho
  function handleMouseDown(e: React.MouseEvent) {
    setIsDrawing(true);
    draw(e);
  }

  // 3) Para o desenho quando solta botão ou sai do canvas
  function handleMouseUp() {
    setIsDrawing(false);
  }

  // 4) Ao mover mouse enquanto estiver desenhando, pinta de branco
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDrawing) return;
    draw(e);
  }

  // 5) Função que pinta um círculo branco na posição do cursor no canvas
  function draw(e: React.MouseEvent) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();

    // Coordenadas x/y proporcionais à resolução do canvas
    const x = ((e.clientX - rect.left) / rect.width) * canvasSize;
    const y = ((e.clientY - rect.top)  / rect.height) * canvasSize;

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2); // pincel circular de raio 12px
    ctx.fill();
    ctx.closePath();
  }

  // 6) Quando clica em “Usar Máscara Atual”, converte o conteúdo do canvas em Blob PNG
  function handleExportMask() {
    const canvas = canvasRef.current!;
    canvas.toBlob((blob) => {
      if (blob) {
        onMaskChange(blob);
      }
    }, "image/png");
  }

  return (
    <div className="flex flex-col items-center">
      {/* Container: imagem original embaixo e canvas por cima */}
      <div
        style={{
          position: "relative",
          width:  canvasSize,
          height: canvasSize,
          marginBottom: 8,
        }}
      >
        {/* 1) Imagem do carro como plano de fundo */}
        <img
          src={imageUrl}
          alt="Preview do carro"
          style={{
            width:       canvasSize,
            height:      canvasSize,
            objectFit:   "cover",
            position:    "absolute",
            top:         0,
            left:        0,
            zIndex:      0,
          }}
        />
        {/* 2) Canvas transparente acima para “rabiscar” */}
        <canvas
          ref={canvasRef}
          style={{
            position:    "absolute",
            top:         0,
            left:        0,
            cursor:      "crosshair",
            zIndex:      1,
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* 3) Botão para exportar o canvas (PNG preto/branco) para o FormData */}
      <button
        onClick={handleExportMask}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Usar Máscara Atual
      </button>
      <p className="text-xs text-gray-500 mt-1 text-center">
        Rabisque em branco as áreas que deseja editar; em preto, as que
        devem permanecer inalteradas. Depois clique em “Usar Máscara Atual”.
      </p>
    </div>
  );
}
