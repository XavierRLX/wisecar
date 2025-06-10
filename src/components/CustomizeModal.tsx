// CustomizeModal.tsx
"use client";

import { useState } from "react";
import MaskEditor from "./MaskEditor";

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

  // atualiza máscara
  function handleMaskChange(blob: Blob) {
    setMaskBlob(blob);
    setMaskPreview(URL.createObjectURL(blob));
  }

  // chama API
  async function handleGenerate() {
    if (!maskBlob || !promptText) return alert("Preencha prompt e máscara.");
    setIsLoading(true);
    try {
      const [respImg, maskBmp] = await Promise.all([
        fetch(imageUrl).then(r => r.blob()).then(b => createImageBitmap(b)),
        createImageBitmap(maskBlob),
      ]);
      const toBlob = async (bmp: ImageBitmap) => {
        const c = document.createElement("canvas");
        c.width = 256; c.height = 256;
        c.getContext("2d")!.drawImage(bmp, 0, 0, 256, 256);
        return new Promise<Blob>(r => c.toBlob(b => r(b!), "image/png"));
      };
      const [imagePng, maskPng] = await Promise.all([toBlob(respImg), toBlob(maskBmp)]);
      const form = new FormData();
      form.append("prompt", promptText);
      form.append("image", imagePng, "image.png");
      form.append("mask", maskPng, "mask.png");

      const res = await fetch(`/api/veiculos/${vehicleId}/customize`, {
        method: "POST", body: form,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao gerar IA");
      const data = await res.json();
      setEditedUrl(data.editedUrl);
    } catch (e: any) {
      alert(e.message);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  // --------------------
  // ✨ Resultado final ✨
  if (editedUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center">Resultado da IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Original</p>
              <img alt="img" src={imageUrl} className="mx-auto w-full h-48 object-contain rounded border" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Editado</p>
              <img alt="img" src={editedUrl} className="mx-auto w-full h-48 object-contain rounded border" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-2">
            <a
              href={editedUrl}
              download={`veiculo-${vehicleId}.png`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >Baixar</a>
            <button
              onClick={() => setEditedUrl(null)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >Refazer</button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------
  // ✏️ Modal de edição ✏️
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-5">
        <h2 className="text-xl font-semibold text-center">Editar veículo com IA</h2>
        <p className="text-gray-600 text-center text-sm">
          1. Pinte sobre a imagem para <b>selecionar</b> áreas.<br />
          No modo <b>Branco</b>, áreas serão editadas.<br />
          No modo <b>Borracha</b>, remova seleção.<br />
          Clique no botão abaixo para alternar. Touch-input ativado. 
        </p>

        <MaskEditor imageUrl={imageUrl} canvasSize={256} onMaskChange={handleMaskChange} />

        <div>
          <label className="block text-sm font-medium mb-1">2. O que deseja mudar? (em inglês):</label>
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            rows={3}
            placeholder="e.g. Paint the wheels matte black and add a spoiler"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !maskBlob || !promptText}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >{isLoading ? "Gerando..." : "Gerar Imagem IA"}</button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >Cancelar</button>
        </div>

        {maskPreview && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">Preview da máscara exportada:</p>
            <img alt="img" src={maskPreview} className="mx-auto w-20 h-20 object-contain border rounded" />
          </div>
        )}
      </div>
    </div>
  );
}
