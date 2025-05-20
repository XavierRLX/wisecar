// app/admin/lojas/novo/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";
import FileUpload from "@/components/FileUpload";

interface ServiceForm {
  name: string;
  description: string;
  price: string;
}

export default function NewStorePage() {
  const router = useRouter();

  // Dados da loja
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");
  const [description, setDescription] = useState("");

  // Fotos da loja
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  React.useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [files]);

  // Serviços
  const [services, setServices] = useState<ServiceForm[]>([]);
  const [newService, setNewService] = useState<ServiceForm>({
    name: "",
    description: "",
    price: "",
  });

  const partsTotal = useMemo(() => services.length, [services]);

  // estados
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function handleAddService() {
    if (!newService.name.trim()) {
      alert("Informe o nome do serviço");
      return;
    }
    setServices(s => [...s, newService]);
    setNewService({ name: "", description: "", price: "" });
  }

  function handleRemoveService(idx: number) {
    setServices(s => s.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1) insere provider
    const { data: store, error: e1 } = await supabase
      .from("service_providers")
      .insert({
        profile_id: supabase.auth.user()?.id, // ou atribua admin
        name,
        address,
        phone,
        social_media: social,
        description,
      })
      .select("id")
      .single();

    if (e1 || !store?.id) {
      setError(e1?.message || "Erro ao criar loja");
      setLoading(false);
      return;
    }

    const storeId = store.id;

    // 2) insere serviços
    const { error: e2 } = await supabase
      .from("services")
      .insert(
        services.map(s => ({
          service_provider_id: storeId,
          name: s.name,
          description: s.description,
          price: parseFloat(s.price) || 0,
        }))
      );
    if (e2) {
      setError(e2.message);
      setLoading(false);
      return;
    }

    // 3) faz upload das imagens
    const uploads = await Promise.all(
      files.map(async file => {
        const filePath = `stores/${storeId}/${crypto.randomUUID()}_${file.name}`;
        const { data, error: upErr } = await supabase
          .storage
          .from("service-provider-photos")
          .upload(filePath, file);
        if (upErr) throw upErr;
        return supabase
          .from("service_provider_images")
          .insert({
            service_id: storeId,
            image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-provider-photos/${filePath}`
          });
      })
    );
    // se algum upload falhar:
    const uploadErr = uploads.find(r => (r as any).error);
    if (uploadErr) {
      setError((uploadErr as any).error.message);
      setLoading(false);
      return;
    }

    // tudo OK
    router.push("/admin/lojas");
  }

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Nova Loja / Prestador</h1>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          {/* DADOS DA LOJA */}
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Nome</span>
              <input
                className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Endereço</span>
              <input
                className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Telefone</span>
                <input
                  className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Redes Sociais</span>
                <input
                  className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  value={social}
                  onChange={e => setSocial(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Descrição</span>
              <textarea
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </label>
          </div>

          {/* UPLOAD DE FOTOS */}
          <div>
            <span className="text-sm font-medium text-gray-700">Fotos da Loja</span>
            <FileUpload
              previewUrls={previewUrls}
              onFileChange={files => setFiles(files)}
              onRemoveFile={idx => setFiles(f => f.filter((_, i) => i !== idx))}
            />
          </div>

          {/* SERVIÇOS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Serviços Oferecidos</h2>

            {/* repetidor de novo serviço */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded">
              <input
                placeholder="Nome do Serviço"
                value={newService.name}
                onChange={e => setNewService({ ...newService, name: e.target.value })}
                className="col-span-1 sm:col-span-1 border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                placeholder="Descrição"
                value={newService.description}
                onChange={e => setNewService({ ...newService, description: e.target.value })}
                className="col-span-1 sm:col-span-1 border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                placeholder="Preço (R$)"
                type="number"
                step="0.01"
                value={newService.price}
                onChange={e => setNewService({ ...newService, price: e.target.value })}
                className="col-span-1 sm:col-span-1 border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="col-span-1 sm:col-span-3 inline-flex items-center gap-2 text-green-600 hover:text-green-800"
              >
                + Adicionar Serviço
              </button>
            </div>

            {/* lista de serviços */}
            {services.length > 0 && (
              <ul className="space-y-2">
                {services.map((s, i) => (
                  <li key={i} className="flex justify-between bg-gray-100 p-3 rounded">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-gray-600">{s.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">R$ {parseFloat(s.price).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* BOTÕES FINAIS */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? <LoadingState message="Salvando..." /> : "Criar Loja"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-3 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
