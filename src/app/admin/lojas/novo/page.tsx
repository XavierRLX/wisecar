// app/lojas/novo/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Trash2 } from "lucide-react";

interface ServiceForm {
  name: string;
  description: string;
  price: number;
  images: File[];
  previewUrls: string[];
}

export default function NewServiceProviderPage() {
  const router = useRouter();

  const [providerData, setProviderData] = useState<{
    name: string;
    address: string;
    phone: string;
    social_media: string;
    description: string;
    images: File[];
    previewUrls: string[];
  }>({
    name: "",
    address: "",
    phone: "",
    social_media: "",
    description: "",
    images: [],
    previewUrls: [],
  });

  const [services, setServices] = useState<ServiceForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // previews da loja
  useEffect(() => {
    const urls = providerData.images.map((f) => URL.createObjectURL(f));
    setProviderData((p) => ({ ...p, previewUrls: urls }));
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [providerData.images]);

  function handleProviderImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    setProviderData((p) => ({ ...p, images: files }));
  }

  function addService() {
    setServices((s) => [
      ...s,
      { name: "", description: "", price: 0, images: [], previewUrls: [] },
    ]);
  }

  function removeService(idx: number) {
    setServices((s) => s.filter((_, i) => i !== idx));
  }

  function handleServiceImagesChange(
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    const urls = files.map((f) => URL.createObjectURL(f));
    setServices((s) =>
      s.map((svc, i) =>
        i === idx ? { ...svc, images: files, previewUrls: urls } : svc
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Você precisa estar logado para criar uma loja.");
      setLoading(false);
      return;
    }

    // 1) cria service_provider
    const { data: prov, error: err1 } = await supabase
      .from("service_providers")           // <--- sem genérico
      .insert([
        {
          profile_id: user.id,
          name: providerData.name,
          address: providerData.address,
          phone: providerData.phone,
          social_media: providerData.social_media,
          description: providerData.description,
        },
      ])
      .select("id")
      .single();
    if (err1 || !prov?.id) {
      setError(err1?.message || "Falha ao criar a loja.");
      setLoading(false);
      return;
    }
    const providerId = prov.id;

    // 2) upload imagens da loja
    for (let file of providerData.images) {
      const path = `service-providers/${providerId}/${file.name}`;
      await supabase.storage.from("service-provider-images").upload(path, file);
      const { data: urlData } = supabase.storage
        .from("service-provider-images")
        .getPublicUrl(path);
      await supabase.from("service_provider_images").insert({
        service_provider_id: providerId,
        image_url: urlData.publicUrl,
      });
    }

    // 3) cria serviços + imagens
    for (let svc of services) {
      const { data: sdata, error: err2 } = await supabase
        .from("services")               // <--- sem genérico
        .insert([
          {
            service_provider_id: providerId,
            name: svc.name,
            description: svc.description,
            price: svc.price,
          },
        ])
        .select("id")
        .single();
      if (err2 || !sdata?.id) {
        console.error("Erro ao criar serviço:", err2);
        continue;
      }
      const serviceId = sdata.id;

      for (let file of svc.images) {
        const path = `services/${serviceId}/${file.name}`;
        await supabase.storage.from("service-images").upload(path, file);
        const { data: urlData } = supabase.storage
          .from("service-images")
          .getPublicUrl(path);
        await supabase.from("service_images").insert({
          service_id: serviceId,
          image_url: urlData.publicUrl,
        });
      }
    }

    setLoading(false);
    router.push("/lojas");
  }

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-8">
        <h1 className="text-2xl font-bold">Nova Loja / Prestador de Serviço</h1>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados da Loja */}
          <section className="space-y-4">
            <h2 className="font-semibold">Dados da Loja</h2>
            {/* Campos nome/address/phone/social */}
            <div className="grid grid-cols-1 gap-4">
              {[
                ["Nome", "name"],
                ["Endereço", "address"],
                ["Telefone", "phone"],
                ["Redes Sociais", "social_media"],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={(providerData as any)[key]}
                    onChange={(e) =>
                      setProviderData((p) => ({
                        ...p,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required={key === "name"}
                  />
                </div>
              ))}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                value={providerData.description}
                onChange={(e) =>
                  setProviderData((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Upload e preview da loja */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotos da Loja (até 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleProviderImagesChange}
                className="block w-full text-sm"
              />
              <div className="mt-2 flex space-x-2 overflow-x-auto">
                {providerData.previewUrls.map((u, i) => (
                  <img
                    key={i}
                    src={u}
                    alt={`Preview da loja ${i + 1}`}  // <-- alt obrigatório!
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Serviços */}
          <section className="space-y-4">
            <h2 className="font-semibold flex items-center justify-between">
              Serviços
              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
              >
                <PlusCircle /> Adicionar Serviço
              </button>
            </h2>
            <div className="space-y-6">
              {services.map((svc, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Serviço #{i + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Serviço
                      </label>
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) =>
                          setServices((arr) =>
                            arr.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x
                            )
                          )
                        }
                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        rows={2}
                        value={svc.description}
                        onChange={(e) =>
                          setServices((arr) =>
                            arr.map((x, j) =>
                              j === i
                                ? { ...x, description: e.target.value }
                                : x
                            )
                          )
                        }
                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {/* Preço */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={svc.price}
                        onChange={(e) =>
                          setServices((arr) =>
                            arr.map((x, j) =>
                              j === i
                                ? { ...x, price: parseFloat(e.target.value) }
                                : x
                            )
                          )
                        }
                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {/* Upload e preview do serviço */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fotos do Serviço (até 5)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleServiceImagesChange(i, e)}
                        className="block w-full text-sm"
                      />
                      <div className="mt-2 flex space-x-2 overflow-x-auto">
                        {svc.previewUrls.map((u, idx) => (
                          <img
                            key={idx}
                            src={u}
                            alt={`Preview do serviço ${i + 1} - foto ${idx +
                              1}`}  // <-- alt aqui também!
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? <LoadingState message="Salvando…" /> : "Criar Loja"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
