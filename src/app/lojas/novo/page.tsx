"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AdminGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { supabase } from "@/lib/supabase";
import { submitProviderData, submitServiceData } from "@/lib/providerService";
import type { ServiceCategory } from "@/types";

interface ServiceForm {
  name: string;
  details: string;
  price: string;
  files: File[];
  previewUrls: string[];
}

export default function NewProviderPage() {
  const router = useRouter();

  // --- Provider fields ---
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [socialMedia, setSocialMedia] = useState({ instagram: "", facebook: "" });
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // --- Categories (provider) ---
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // --- Provider images ---
  const [providerFiles, setProviderFiles] = useState<File[]>([]);
  const [providerPreviews, setProviderPreviews] = useState<string[]>([]);

  // --- Dynamic Services ---
  const [services, setServices] = useState<ServiceForm[]>([]);

  // --- Loading ---
  const [loading, setLoading] = useState(false);

  // Carregar categorias
  useEffect(() => {
    supabase.from("service_categories").select("id,name").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  // Preview imagens da loja
  useEffect(() => {
    const urls = providerFiles.map((f) => URL.createObjectURL(f));
    setProviderPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [providerFiles]);

  // Adiciona um novo serviço
  const addService = () => {
    setServices((prev) => [
      ...prev,
      { name: "", details: "", price: "", files: [], previewUrls: [] },
    ]);
  };

  // Remove um serviço
  const removeService = (idx: number) => {
    setServices((prev) => prev.filter((_, i) => i !== idx));
  };

  // Atualiza campos de texto do serviço
  const handleServiceChange = (
    idx: number,
    field: keyof Omit<ServiceForm, 'files' | 'previewUrls'>,
    value: string
  ) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Upload e preview para arquivos de serviço
  const handleServiceFileChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    const previews = files.map((f) => URL.createObjectURL(f));
    setServices((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], files, previewUrls: previews };
      return copy;
    });
  };

  // Remove imagem de um serviço
  const handleRemoveServiceFile = (sIdx: number, fIdx: number) => {
    setServices((prev) => {
      const copy = [...prev];
      const svc = { ...copy[sIdx] };
      svc.files = svc.files.filter((_, i) => i !== fIdx);
      svc.previewUrls = svc.previewUrls.filter((_, i) => i !== fIdx);
      copy[sIdx] = svc;
      return copy;
    });
  };

  // Submissão geral: Loja + Serviços
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Cria a loja com categorias e imagens
      const provider = await submitProviderData(
        user.id,
        {
          name,
          address,
          description,
          phone,
          social_media: socialMedia,
          state,
          city,
          neighborhood,
          categoryIds: selectedCategories,
        },
        providerFiles
      );

      // Cria cada serviço associado
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome da Loja"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <input
            type="text"
            placeholder="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded p-2"
          />

          <textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
          />

          {/* Redes Sociais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Instagram"
              value={socialMedia.instagram}
              onChange={(e) =>
                setSocialMedia((s) => ({ ...s, instagram: e.target.value }))
              }
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              placeholder="Facebook"
              value={socialMedia.facebook}
              onChange={(e) =>
                setSocialMedia((s) => ({ ...s, facebook: e.target.value }))
              }
              className="w-full border rounded p-2"
            />
          </div>

          {/* Localização */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Estado"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Cidade"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="border rounded p-2"
            />
          </div>

          {/* Categorias de Serviço (Provider) */}
          <div>
                <label className="block font-medium mb-2">Categorias</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((c) => (
                    <label key={c.id} className="inline-flex items-center space-x-2">
                        <input
                        type="checkbox"
                        value={c.id}
                        checked={selectedCategories.includes(c.id)}
                        onChange={(e) => {
                            const id = c.id;
                            setSelectedCategories((prev) =>
                            e.target.checked
                                ? [...prev, id]      // adiciona
                                : prev.filter((x) => x !== id) // remove
                            );
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700">{c.name}</span>
                    </label>
                    ))}
                </div>
                </div>
          {/* Imagens da Loja */}
          <div>
            <label className="block font-medium mb-1">Imagens da Loja (máx.5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setProviderFiles(Array.from(e.target.files || []).slice(0, 5))
              }
              className="block w-full"
            />
            {providerPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {providerPreviews.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt={`Preview loja ${i + 1}`}
                      className="h-24 w-full object-cover rounded" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Serviços Dinâmicos */}
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

            {services.map((svc, idx) => (
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

                <input
                  type="text"
                  placeholder="Nome do Serviço"
                  value={svc.name}
                  onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                  className="w-full border rounded p-2"
                />
                <textarea
                  placeholder="Detalhes"
                  value={svc.details}
                  onChange={(e) => handleServiceChange(idx, 'details', e.target.value)}
                  className="w-full border rounded p-2"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  value={svc.price}
                  onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                  className="w-full border rounded p-2"
                />

                <div>
                  <label className="block font-medium mb-1">Imagens (máx.5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleServiceFileChange(idx, e)}
                    className="block w-full"
                  />
                  {svc.previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {svc.previewUrls.map((url, j) => (
                        <div key={j} className="relative">
                          <img
                            src={url}
                            alt={`Preview serviço ${idx + 1} img ${j + 1}`}
                            className="h-24 w-full object-cover rounded"
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
