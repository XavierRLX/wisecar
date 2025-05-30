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
  price: string;
  items: ItemForm[];
}

export default function NewProviderPage() {
  const router = useRouter();

  // — Dados da Loja —
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [socialMedia, setSocialMedia] = useState({ instagram: '', facebook: '' });
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  // — Logo + Galeria —
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // — Categorias de Serviços —
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // — Serviço Atual & Serviços Salvos —
  const emptyService: ServiceForm = { name: '', categoryId: 0, price: '', items: [] };
  const [currentService, setCurrentService] = useState<ServiceForm>(emptyService);
  const [savedServices, setSavedServices] = useState<ServiceForm[]>([]);

  const [loading, setLoading] = useState(false);

  // Carrega categorias
  useEffect(() => {
    supabase
      .from('service_categories')
      .select('id,name')
      .then(({ data }) => data && setCategories(data));
  }, []);

  // Ajusta categoryId inicial quando categories chega
  useEffect(() => {
    if (categories.length && currentService.categoryId === 0) {
      setCurrentService(cs => ({ ...cs, categoryId: categories[0].id }));
    }
  }, [categories]);

  // Previews de logo e galeria
  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    const urls = galleryFiles.map(f => URL.createObjectURL(f));
    setGalleryPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [galleryFiles]);

  // — Handlers Serviço Atual —
  const handleServiceField = (
    field: keyof Omit<ServiceForm, 'items'>,
    value: any
  ) =>
    setCurrentService(cs => ({
      ...cs,
      [field]: value,
    }));

  const addItem = () =>
    setCurrentService(cs => ({
      ...cs,
      items: [...cs.items, { name: '', details: '', price: '', files: [], previewUrls: [] }],
    }));

  const removeItem = (iIdx: number) =>
    setCurrentService(cs => ({
      ...cs,
      items: cs.items.filter((_, i) => i !== iIdx),
    }));

  const handleItemField = (
    iIdx: number,
    field: keyof ItemForm,
    value: any
  ) =>
    setCurrentService(cs => {
      const items = [...cs.items];
      (items[iIdx] as any)[field] = value;
      return { ...cs, items };
    });

  const handleItemFiles = (iIdx: number, files: File[]) =>
    setCurrentService(cs => {
      const items = [...cs.items];
      items[iIdx].files = files;
      items[iIdx].previewUrls = files.map(f => URL.createObjectURL(f));
      return { ...cs, items };
    });

  // — Salvar/Editar/Remover Serviços —
  const saveService = () => {
    if (!currentService.name.trim() || !currentService.price.trim()) {
      alert('Preencha nome e preço do serviço antes de salvar.');
      return;
    }
    setSavedServices(prev => [...prev, currentService]);
    setCurrentService({ ...emptyService, categoryId: categories[0]?.id || 0 });
  };

  const removeSavedService = (idx: number) =>
    setSavedServices(prev => prev.filter((_, i) => i !== idx));

  const editSavedService = (idx: number) => {
    const svc = savedServices[idx];
    setCurrentService(svc);
    setSavedServices(prev => prev.filter((_, i) => i !== idx));
  };

  // — Envio Final —
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Se tiver serviço atual não salvo, pergunta se salva
      if ((currentService.name || currentService.items.length) && !savedServices.includes(currentService)) {
        if (confirm('Você tem um serviço não salvo. Deseja salvar antes de enviar?')) {
          saveService();
        }
      }
      if (savedServices.length === 0) {
        alert('Adicione pelo menos um serviço.');
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1️⃣ Cria loja
      const provider = await submitProviderData(
        user.id,
        { name, address, description, phone, social_media: socialMedia, state, city, neighborhood },
        logoFile,
        galleryFiles
      );

      // 2️⃣ Cria cada serviço salvo
      await Promise.all(
        savedServices.map(svc =>
          submitServiceData(provider.id, {
            name: svc.name,
            categoryId: svc.categoryId,
            price: parseFloat(svc.price),
            items: svc.items.map(it => ({
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
              onChange={e => setLogoFile(e.target.files?.[0] || null)}
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
              onChange={e => setName(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Telefone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <input
            type="text"
            placeholder="Endereço"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full border rounded p-2"
          />
          <textarea
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded p-2"
          />

          {/* Redes Sociais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Instagram"
              value={socialMedia.instagram}
              onChange={e =>
                setSocialMedia(prev => ({ ...prev, instagram: e.target.value }))
              }
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              placeholder="Facebook"
              value={socialMedia.facebook}
              onChange={e =>
                setSocialMedia(prev => ({ ...prev, facebook: e.target.value }))
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
              onChange={e => setState(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Cidade"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Bairro"
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
              className="border rounded p-2"
            />
          </div>

          {/* Galeria da Loja */}
          <div>
            <label className="block font-medium mb-1">
              Imagens da Loja (máx. 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e =>
                setGalleryFiles(
                  Array.from(e.target.files || []).slice(0, 5)
                )
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

          {/* — Formulário de Serviço Atual — */}
          <div className="border p-4 rounded space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Novo Serviço</h2>
              <button
                type="button"
                onClick={saveService}
                className="px-3 py-1 bg-green-100 text-green-700 rounded"
              >
                Salvar Serviço
              </button>
            </div>

            <input
              type="text"
              placeholder="Nome do Serviço"
              value={currentService.name}
              onChange={e => handleServiceField('name', e.target.value)}
              className="w-full border rounded p-2"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={currentService.categoryId}
                onChange={e => handleServiceField('categoryId', parseInt(e.target.value))}
                className="border rounded p-2"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Preço a partir de"
                value={currentService.price}
                onChange={e => handleServiceField('price', e.target.value)}
                className="border rounded p-2"
                required
              />
            </div>

            {/* Itens do Serviço */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Itens</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-blue-600"
                >
                  + Item
                </button>
              </div>
              {currentService.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  className="mt-2 p-2 border rounded space-y-2"
                >
                  <div className="flex justify-between">
                    <span>Item {iIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(iIdx)}
                      className="text-red-600"
                    >
                      X
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nome do item"
                    value={item.name}
                    onChange={e => handleItemField(iIdx, 'name', e.target.value)}
                    className="w-full border rounded p-2"
                  />
                  <input
                    type="text"
                    placeholder="Detalhes do item"
                    value={item.details}
                    onChange={e => handleItemField(iIdx, 'details', e.target.value)}
                    className="w-full border rounded p-2"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço do item"
                    value={item.price}
                    onChange={e => handleItemField(iIdx, 'price', e.target.value)}
                    className="w-full border rounded p-2"
                  />
                  <div>
                    <label className="block mb-1">Imagens do Item</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e =>
                        handleItemFiles(
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

          {/* — Lista de Serviços Salvos — */}
          {savedServices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Serviços Adicionados</h2>
              {savedServices.map((svc, idx) => (
                <div
                  key={idx}
                  className="border p-4 rounded flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium">
                      {svc.name} –{' '}
                      {categories.find(c => c.id === svc.categoryId)?.name} – R${' '}
                      {svc.price}
                    </p>
                    <ul className="list-disc ml-5 mt-2">
                      {svc.items.map((it, i) => (
                        <li key={i}>
                          {it.name} (R$ {it.price})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => editSavedService(idx)}
                      className="text-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedService(idx)}
                      className="text-red-600"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* — Botão Final — */}
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
