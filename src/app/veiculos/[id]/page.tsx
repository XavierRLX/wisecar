"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchFipeAtualizado } from "@/lib/fipe";
import { Vehicle, VehicleStatus } from "@/types";
import BackButton from "@/components/BackButton";
import AuthGuard from "@/components/AuthGuard";
import LoadingState from "@/components/LoadingState";
import Carousel from "@/components/Carousel";
import {
  Calendar,
  DollarSign,
  Activity,
  Palette,
  Droplet,
  RefreshCw,
  Edit2,
  CheckCircle,
} from "lucide-react";
import SellerDetails from "@/components/SellerDetails";
import OptionalList from "@/components/OptionalList";
import MaskEditor from "@/components/MaskEditor"; // import do MaskEditor

/** ========================================================================
 * 1) COMPONENTE CustomizeModal (usa MaskEditor para gerar a máscara)
 * ======================================================================== */
interface CustomizeModalProps {
  imageUrl: string;
  vehicleId: string;
  onClose: () => void;
}

function CustomizeModal({ imageUrl, vehicleId, onClose }: CustomizeModalProps) {
  const [promptText, setPromptText] = useState<string>("Carro na cor preta");
  const [maskBlob, setMaskBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  const promptTips = [
    "Use adjetivos claros: ‘fosco’, ‘metálico’, ‘neon’.",
    "Exemplo: ‘Pinte as rodas de azul metálico’",
    "Se quiser alterar fundo: ‘Mude o fundo para uma pista de corrida neon’",
    "Combine: ‘Carro vermelho esportivo, rodas prateadas’",
  ];

  // 1.1) Ao clicar em "Gerar Imagem IA"
  async function handleGenerate() {
    if (!maskBlob) {
      alert("Primeiro clique em ‘Usar Máscara Atual’ para gerar o PNG de máscara.");
      return;
    }

    setIsLoading(true);
    try {
      // 1.1.1) Baixar a imagem original no cliente como Blob
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) {
        throw new Error("Falha ao baixar a imagem no cliente.");
      }
      const imageBlob = await imgResponse.blob();

      // 1.1.2) Montar FormData
      const formData = new FormData();
      formData.append("prompt", promptText);
      formData.append("image", imageBlob, "image.png"); // envia a imagem original
      formData.append("mask",  maskBlob,  "mask.png");   // envia a máscara do MaskEditor

      // 1.1.3) Chamar nossa API de edição
      const res = await fetch(`/api/veiculos/${vehicleId}/customize`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || "Falha ao gerar imagem.");
      }

      const data = await res.json();
      setEditedUrl(data.editedUrl as string);
    } catch (err: any) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // 1.2) Se já existe editedUrl, mostramos o resultado + botões
  if (editedUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
          <h2 className="text-xl font-semibold">Resultado da IA</h2>
          <div className="w-full h-52 bg-gray-100 flex items-center justify-center rounded">
            <img
              src={editedUrl}
              alt="Imagem gerada pela IA"
              className="max-h-52 object-contain rounded"
            />
          </div>
          <div className="flex justify-between">
            <a
              href={editedUrl}
              download={`veiculo-${vehicleId}-customizado.png`}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Download
            </a>
            <button
              onClick={() => setEditedUrl(null)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Refazer
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-2 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // 1.3) Caso ainda não tenha gerado, mostramos formulário + MaskEditor
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Personalizar com IA</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        {/* 1.3.1) Preview da imagem original (256×256) */}
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded">
          <img
            src={imageUrl}
            alt="Preview original"
            className="max-h-48 object-contain rounded"
          />
        </div>

        {/* 1.3.2) Campo de prompt */}
        <label className="block text-sm font-medium">Prompt de edição:</label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={2}
          className="w-full border rounded px-2 py-1"
        />

        {/* 1.3.3) Dicas de prompt */}
        <ul className="list-disc list-inside text-xs text-gray-500">
          {promptTips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>

        {/* 1.3.4) MaskEditor: rabisca diretamente sobre a imagem */}
        <MaskEditor
          imageUrl={imageUrl}
          canvasSize={256}               // mesma resolução que usaremos na API
          onMaskChange={(blob) => setMaskBlob(blob)}
        />

        {/* 1.3.5) Botão Gerar IA */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !maskBlob}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isLoading ? "Gerando…" : "Gerar Imagem IA"}
        </button>
      </div>
    </div>
  );
}
