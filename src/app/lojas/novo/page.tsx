"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { supabase } from "@/lib/supabase";
import { submitProviderData, submitServiceData } from "@/lib/providerService";

interface ServiceForm {
  name: string;
  details: string;
  price: string;
  files: File[];
  previewUrls: string[];
}

export default function NewProviderPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [providerFiles, setProviderFiles] = useState<File[]>([]);
  const [providerPreviews, setProviderPreviews] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceForm[]>([]);
  const [loading, setLoading] = useState(false);

  // Preview para imagens da loja
  useEffect(() => {
    const urls = providerFiles.map((file) => URL.createObjectURL(file));
    setProviderPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [providerFiles]);

  // Adiciona novo form de serviço
  const addService = () => {
    setServices((prev) => [
      ...prev,
      { name: "", details: "", price: "", files: [], previewUrls: [] },
    ]);
  };

  // Remove um form de serviço
  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Atualiza campos de texto do serviço
  const handleServiceChange = (
    index: number,
    field: keyof Omit<ServiceForm, 'files' | 'previewUrls'>,
    value: string
  ) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Handle upload e preview para arquivos de serviço
  const handleServiceFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    const previews = files.map((f) => URL.createObjectURL(f));
    setServices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], files, previewUrls: previews };
      return copy;
    });
  };

  const handleRemoveServiceFile = (sIndex: number, fIndex: number) => {
    setServices((prev) => {
      const copy = [...prev];
      const service = { ...copy[sIndex] };
      service.files = service.files.filter((_, i) => i !== fIndex);
      service.previewUrls = service.previewUrls.filter((_, i) => i !== fIndex);
      copy[sIndex] = service;
      return copy;
    });
  };

  // Submit geral: loja + serviços
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Cria a loja
      const provider = await submitProviderData(
        user.id,
        { name, address, description },
        providerFiles
      );

      // Cria cada serviço
      await Promise.all(
        services.map((s) =>
          submitServiceData(
            provider.id,
            { name: s.name, details: s.details, price: parseFloat(s.price) },
            s.files
          )
        )
      );

      router.push("/lojas");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao criar loja e serviços: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded space-y-6">
        <h1 className="text-2xl font-bold">Cadastrar Nova Loja e Serviços</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados da Loja */}
          <div>
            <label className="block font-medium">Nome da Loja</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium">Endereço</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Imagens da Loja (máx. 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setProviderFiles(Array.from(e.target.files || []).slice(0, 5))}
              className="block w-full"
            />
            {providerPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {providerPreviews.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt={`Pré-visualização da loja ${i + 1}`}
                      className="h-32 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setProviderFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black text-white rounded-full p-1"
                      aria-label="Remover imagem"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Serviços */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Serviços</h2>
              <button
                type="button"
                onClick={addService}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
              >
                + Adicionar Serviço
              </button>
            </div>
            {services.map((service, idx) => (
              <div key={idx} className="border rounded p-4 mb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Serviço {idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeService(idx)}
                    className="text-red-600"
                  >
                    Remover
                  </button>
                </div>
                <div>
                  <label className="block">Nome</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block">Detalhes</label>
                  <textarea
                    value={service.details}
                    onChange={(e) => handleServiceChange(idx, 'details', e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={service.price}
                    onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Imagens (máx.5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleServiceFileChange(idx, e)}
                    className="block w-full"
                  />
                  {service.previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {service.previewUrls.map((url, j) => (
                        <div key={j} className="relative">
                          <img
                            src={url}
                            alt={`Pré-visualização do serviço ${idx + 1} imagem ${j + 1}`}
                            className="h-32 w-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceFile(idx, j)}
                            className="absolute top-1 right-1 bg-black text-white rounded-full p-1"
                            aria-label="Remover imagem do serviço"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded"
          >
            {loading ? "Salvando..." : "Criar Loja e Serviços"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}