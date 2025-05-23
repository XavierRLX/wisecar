// app/lojas/novo/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AdminGuard';
import EnsureProfile from '@/components/EnsureProfile';
import { supabase } from '@/lib/supabase';
import { submitProviderData, submitServiceData } from '@/lib/providerService';
import type { ServiceCategory } from '@/types';

interface ItemForm {
  name: string;
  details: string;
  price: string;
  files: File[];
  previewUrls: string[];
}

interface ServiceForm {
  name: string;
  categoryId: number;
  items: ItemForm[];
}

export default function NewProviderPage() {
  const router = useRouter();

  // --- Loja ---
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [socialMedia, setSocialMedia] = useState({ instagram: '', facebook: '' });
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  // logo + galeria
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // categorias da loja
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // serviços dinâmicos
  const [services, setServices] = useState<ServiceForm[]>([]);

  const [loading, setLoading] = useState(false);

  // carrega categorias
  useEffect(() => {
    supabase
      .from('service_categories')
      .select('id,name')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  // preview logo
  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  // preview galeria
  useEffect(() => {
    const urls = galleryFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [galleryFiles]);

  // adiciona serviço
  const addService = () => {
    setServices((prev) => [
      ...prev,
      { name: '', categoryId: categories[0]?.id || 0, items: [] },
    ]);
  };

  // remove serviço
  const removeService = (sIdx: number) => {
    setServices((prev) => prev.filter((_, i) => i !== sIdx));
  };

  // atualiza campo do serviço
  const handleServiceField = (
    sIdx: number,
    field: keyof Omit<ServiceForm, 'items'>,
    value: any
  ) => {
    setServices((prev) => {
      const copy = [...prev];
      (copy[sIdx] as any)[field] = value;
      return copy;
    });
  };

  // adiciona item
  const addItem = (sIdx: number) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[sIdx].items.push({ name: '', details: '', price: '', files: [], previewUrls: [] });
      return copy;
    });
  };

  // remove item
  const removeItem = (sIdx: number, iIdx: number) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[sIdx].items = copy[sIdx].items.filter((_, i) => i !== iIdx);
      return copy;
    });
  };

  // atualiza campo do item
  const handleItemField = (
    sIdx: number,
    iIdx: number,
    field: keyof ItemForm,
    value: any
  ) => {
    setServices((prev) => {
      const copy = [...prev];
      (copy[sIdx].items[iIdx] as any)[field] = value;
      return copy;
    });
  };

  // troca arquivos do item
  const handleItemFiles = (
    sIdx: number,
    iIdx: number,
    files: File[]
  ) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[sIdx].items[iIdx].files = files;
      copy[sIdx].items[iIdx].previewUrls = files.map((f) => URL.createObjectURL(f));
      return copy;
    });
  };

  // envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // cria loja
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
        logoFile,
        galleryFiles
      );

      // cria serviços + itens
      await Promise.all(
        services.map((svc) =>
          submitServiceData(provider.id, {
            name: svc.name,
            categoryId: svc.categoryId,
            items: svc.items.map((it) => ({
              name: it.name,
              details: it.details,
              price: parseFloat(it.price),
              files: it.files,
            })),
          })
        )
      );

      router.push('/lojas');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao criar loja e serviços: ' + err.message);
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
          {/* Logo da Loja */}
          <div>
            <label className="block font-medium mb-1">Logo da Loja</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
            {logoPreview && (
              <img src={logoPreview} alt="Logo preview" className="h-24 mt-2" />
            )}
          </div>

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

          {/* Categorias da Loja */}
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
                          ? [...prev, id]
                          : prev.filter((x) => x !== id)
                      );
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Galeria Loja */}
          <div>
            <label className="block font-medium mb-1">Imagens da Loja (máx.5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setGalleryFiles(Array.from(e.target.files || []).slice(0, 5))
              }
              className="block w-full"
            />
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {galleryPreviews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preview loja ${i + 1}`}
                    className="h-24 w-full object-cover rounded"
                  />
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

            {services.map((svc, sIdx) => (
              <div key={sIdx} className="border rounded p-4 mb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Serviço {sIdx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeService(sIdx)}
                    className="text-red-600"
                  >
                    Remover
                  </button>
                </div>

                {/* Nome e Categoria */}
                <input
                  type="text"
                  placeholder="Nome do Serviço"
                  value={svc.name}
                  onChange={(e) =>
                    handleServiceField(sIdx, 'name', e.target.value)
                  }
                  className="w-full border rounded p-2"
                />
                <select
                  value={svc.categoryId}
                  onChange={(e) =>
                    handleServiceField(sIdx, 'categoryId', parseInt(e.target.value))
                  }
                  className="w-full border rounded p-2"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Itens */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Itens</h4>
                    <button
                      type="button"
                      onClick={() => addItem(sIdx)}
                      className="text-sm text-blue-600"
                    >
                      + Item
                    </button>
                  </div>

                  {svc.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="mt-2 p-2 border rounded space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span>Item {iIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(sIdx, iIdx)}
                          className="text-red-600"
                        >
                          X
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Nome do item"
                        value={item.name}
                        onChange={(e) =>
                          handleItemField(sIdx, iIdx, 'name', e.target.value)
                        }
                        className="w-full border rounded p-2"
                      />
                      <input
                        type="text"
                        placeholder="Detalhes do item"
                        value={item.details}
                        onChange={(e) =>
                          handleItemField(sIdx, iIdx, 'details', e.target.value)
                        }
                        className="w-full border rounded p-2"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço do item"
                        value={item.price}
                        onChange={(e) =>
                          handleItemField(sIdx, iIdx, 'price', e.target.value)
                        }
                        className="w-full border rounded p-2"
                      />

                      <div>
                        <label className="block mb-1">Imagens do Item</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            handleItemFiles(
                              sIdx,
                              iIdx,
                              Array.from(e.target.files || []).slice(0, 5)
                            )
                          }
                          className="block w-full"
                        />
                        {item.previewUrls.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {item.previewUrls.map((url, fIdx) => (
                              <div key={fIdx} className="relative">
                                <img
                                  src={url}
                                  alt={`Item ${iIdx + 1} img ${fIdx + 1}`}
                                  className="h-16 w-16 object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleItemField(
                                      sIdx,
                                      iIdx,
                                      'files',
                                      item.files.filter((_, i) => i !== fIdx)
                                    )
                                  }
                                  className="absolute top-0 right-0 bg-black text-white rounded-full text-xs p-1"
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
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded"
          >
            {loading ? 'Salvando...' : 'Criar Loja e Serviços'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
