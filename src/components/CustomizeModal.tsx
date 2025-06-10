"use client";

import { useEffect, useState } from "react";
import { useDeeplab } from "@/lib/useDeeplab";

interface CustomizeModalProps {
  imageUrl: string;
  vehicleId: string;
  onClose: () => void;
}

export default function CustomizeModal({
  imageUrl,
  vehicleId,
  onClose,
}: CustomizeModalProps) {
  const model = useDeeplab();

  const [segMap, setSegMap] = useState<Uint8ClampedArray | null>(null);
  const [segSize, setSegSize] = useState<{ w: number; h: number } | null>(null);
  const [maskBlob, setMaskBlob] = useState<Blob | null>(null);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("Carro na cor preta");
  const [isLoading, setIsLoading] = useState(false);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  // 1. Ao carregar o modelo e a imagem, gera o segmentation map
  useEffect(() => {
    if (!model) return;
    (async () => {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const imgBitmap = await createImageBitmap(blob);
      const off = document.createElement("canvas");
      off.width = imgBitmap.width;
      off.height = imgBitmap.height;
      const ctx = off.getContext("2d")!;
      ctx.drawImage(imgBitmap, 0, 0);
      const result = await model.segment(off);
      setSegMap(result.segmentationMap);
      setSegSize({ w: result.width, h: result.height });
    })();
  }, [model, imageUrl]);

  // Verifica se há carro na segmentação (COCO class 7)
  const hasCar = segMap ? Array.from(segMap).some((c) => c === 7) : false;

  // Gera máscara automática com base no tipo selecionado
  function applyMask(type: "car" | "background") {
    if (!segMap || !segSize) return;
    const { w, h } = segSize;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d")!;
    const imgData = ctx.createImageData(w, h);

    segMap.forEach((classId, i) => {
      const white = type === "car" ? classId === 7 : classId !== 7;
      imgData.data[i * 4 + 0] = white ? 255 : 0;
      imgData.data[i * 4 + 1] = white ? 255 : 0;
      imgData.data[i * 4 + 2] = white ? 255 : 0;
      imgData.data[i * 4 + 3] = 255;
    });

    ctx.putImageData(imgData, 0, 0);
    off.toBlob((b) => {
      if (b) {
        setMaskBlob(b);
        setMaskPreview(URL.createObjectURL(b));
      }
    }, "image/png");
  }

  // 3. Geração de imagem pela API OpenAI
  async function handleGenerate() {
    if (!maskBlob) {
      alert("Selecione primeiro uma máscara (carro ou fundo).");
      return;
    }
    setIsLoading(true);
    try {
      // Redimensiona image e mask para 256×256
      const [respImg, maskBitmap] = await Promise.all([
        fetch(imageUrl).then((r) => r.blob()).then((blob) => createImageBitmap(blob)),
        createImageBitmap(maskBlob),
      ]);

      const makeCanvasBlob = async (bitmap: ImageBitmap) => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0, 256, 256);
        return new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      };

      const [imagePng, maskPng] = await Promise.all([
        makeCanvasBlob(respImg as ImageBitmap),
        makeCanvasBlob(maskBitmap),
      ]);

      const form = new FormData();
      form.append("prompt", promptText);
      form.append("image", imagePng, "image.png");
      form.append("mask", maskPng, "mask.png");

      const apiRes = await fetch(`/api/veiculos/${vehicleId}/customize`, {
        method: "POST",
        body: form,
      });
      if (!apiRes.ok) {
        const err = await apiRes.json();
        throw new Error(err.error || "Falha ao gerar IA");
      }
      const data = await apiRes.json();
      setEditedUrl(data.editedUrl);
    } catch (e: any) {
      alert(e.message);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  // JSX do modal
  if (editedUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
          <h2 className="text-xl font-semibold">Resultado da IA</h2>
          <img
            src={editedUrl}
            alt="Imagem gerada pela IA"
            className="w-full h-52 object-contain rounded bg-gray-100"
          />
          <div className="flex justify-between">
            <a
              href={editedUrl}
              download={`veiculo-${vehicleId}-customizado.png`}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Download
            </a>
            <button
              onClick={() => setEditedUrl(null)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Refazer
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-red-500 text-white rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Personalizar com IA</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">
            ×
          </button>
        </div>

        <img
          src={imageUrl}
          alt="Preview do veículo"
          className="w-full h-48 object-contain rounded bg-gray-100"
        />

        <label className="block text-sm font-medium">Prompt de edição:</label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={2}
          className="w-full border rounded px-2 py-1"
        />

        {segMap ? (
          <div className="flex gap-2">
            <button
              onClick={() => applyMask("car")}
              disabled={!hasCar}
              className="px-3 py-1 bg-indigo-500 text-white rounded disabled:opacity-50"
            >
              Mudar Carro
            </button>
            <button
              onClick={() => applyMask("background")}
              className="px-3 py-1 bg-indigo-500 text-white rounded"
            >
              Mudar Fundo
            </button>
          </div>
        ) : (
          <p>Carregando segmentação...</p>
        )}

        {maskPreview && (
          <div>
            <p className="text-xs text-gray-500">Preview da Máscara:</p>
            <img
              src={maskPreview}
              alt="Preview da máscara"
              className="w-32 h-32 object-contain border rounded"
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading || !maskBlob}
          className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isLoading ? "Gerando…" : "Gerar Imagem IA"}
        </button>
      </div>
    </div>
  );
}
