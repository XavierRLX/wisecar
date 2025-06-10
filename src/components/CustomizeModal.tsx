
//CustomizeModal
"use client";

import { useState } from "react";
import MaskEditor from "./MaskEditor"; // certifique-se que o caminho está correto

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
  const [promptText, setPromptText] = useState("");
  const [maskBlob, setMaskBlob] = useState<Blob | null>(null);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  // Preview da máscara exportada (para download)
  function handleMaskChange(blob: Blob) {
    setMaskBlob(blob);
    setMaskPreview(URL.createObjectURL(blob));
  }

  async function handleGenerate() {
    if (!maskBlob || !promptText) {
      alert("Preencha o prompt e gere a máscara primeiro!");
      return;
    }
    setIsLoading(true);
    try {
      // Redimensionar para 256x256 igual backend espera (ajuste se necessário)
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

  if (editedUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
          <h2 className="text-xl font-semibold">Resultado da IA</h2>
          <div className="flex gap-2">
        <div className="w-1/2">
          <p className="text-center text-sm">Original</p>
          <img
            src={imageUrl}
            alt="Imagem gerada pela IA"
            className="w-full h-52 object-contain rounded bg-gray-100"
          />
        </div>
        <div className="w-1/2">
          <p className="text-center text-sm">Editado</p>
          <img
            src={editedUrl}
            alt="Imagem gerada pela IA"
            className="w-full h-52 object-contain rounded bg-gray-100"
          />
        </div>
      </div>
         
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
        <h2 className="text-xl font-semibold text-center">Editar veículo com IA</h2>
        <p className="text-sm text-gray-600 mb-2 text-center">
          1. <b>Pinte sobre a imagem</b> marcando as áreas que deseja modificar.
          <br />
          Áreas em <b>branco</b> serão alteradas pela IA; áreas em <b>preto</b> serão preservadas.
          <br />
          Segure <b>Ctrl</b> (ou <b>Command</b> no Mac) para apagar (pintar preto).
        </p>
        <MaskEditor
          imageUrl={imageUrl}
          canvasSize={256}
          onMaskChange={handleMaskChange}
        />
        <div className="mt-2">
          <label className="block text-sm font-medium mb-1">
            2. Digite o que deseja mudar (preferencialmente em <b>inglês</b>):
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={2}
            placeholder={`Exemplo: "Make the car look sportier, change the wheels to black, add a spoiler"`}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !maskBlob || !promptText}
          className="w-full py-2 mt-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isLoading ? "Gerando…" : "Gerar Imagem IA"}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 mt-2 bg-gray-300 text-gray-700 rounded"
        >
          Cancelar
        </button>
        {maskPreview && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">Preview da máscara exportada:</p>
            <img
              src={maskPreview}
              alt="Preview da máscara"
              className="w-32 h-32 object-contain border rounded mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
