// lib/providerService.ts
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/hooks/useUploadImage";
import type { Provider, Service } from "@/types";

// busca com filtros de categoria e região
export async function fetchProviders(filters?: {
    categoryId?: number;
    state?: string;
    city?: string;
    neighborhood?: string;
    search?: string;
  }): Promise<Provider[]> {
    let query = supabase
      .from("service_providers")
      .select(`
        *,
        provider_images(*),
        services(*, service_images(*)),
        service_provider_categories!inner(category:service_categories(name))
      `);
  if (filters?.categoryId) {
    query = query.eq("service_provider_categories.category_id", filters.categoryId);
  }
  if (filters?.state) {
    query = query.eq("state", filters.state);
  }
  if (filters?.city) {
    query = query.eq("city", filters.city);
  }
  if (filters?.neighborhood) {
    query = query.eq("neighborhood", filters.neighborhood);
  }
  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchProviderById(id: string): Promise<Provider> {
    const { data, error } = await supabase
      .from("service_providers")
      .select(`
        *,
        provider_images(*),
        services(*, service_images(*)),
        service_provider_categories!inner(category:service_categories(name))
      `)
      .eq("id", id)
      .single();
  
    if (error) throw new Error(error.message);
    return data;
  }

export async function submitProviderData(
  userId: string,
  form: {
    name: string;
    address: string;
    description: string;
    phone: string;
    social_media: Record<string, string>;
    state: string;
    city: string;
    neighborhood: string;
    categoryIds: number[];
  },
  files: File[]
): Promise<Provider> {
  // 1) insere a loja com os novos campos
  const { data: provider, error } = await supabase
    .from("service_providers")
    .insert({
      user_id: userId,
      name: form.name,
      address: form.address,
      description: form.description,
      phone: form.phone,
      social_media: form.social_media,
      state: form.state,
      city: form.city,
      neighborhood: form.neighborhood,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // 2) vincula categorias (pivot)
  if (form.categoryIds.length) {
    const rows = form.categoryIds.map((cid) => ({
      provider_id: provider.id,
      category_id: cid,
    }));
    const { error: catErr } = await supabase
      .from("service_provider_categories")
      .insert(rows);
    if (catErr) throw new Error(catErr.message);
  }

  // 3) upload das imagens da loja
  await Promise.all(
    files.map(async (file) => {
      const url = await uploadImage("provider-images", "providers", provider.id, file);
      if (!url) throw new Error("Falha no upload da imagem: " + file.name);
      await supabase.from("provider_images").insert({
        provider_id: provider.id,
        image_url: url,
      });
    })
  );

  return fetchProviderById(provider.id);
}

export async function submitServiceData(
  providerId: string,
  form: { name: string; details: string; price: number },
  files: File[]
): Promise<Service> {
  // insere o serviço
  const { data, error } = await supabase
    .from("services")
    .insert({ provider_id: providerId, ...form })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // upload das imagens do serviço
  await Promise.all(
    files.map(async (file) => {
      const url = await uploadImage("service-images", "services", data.id, file);
      if (!url) throw new Error("Falha no upload da imagem do serviço: " + file.name);
      await supabase.from("service_images").insert({
        service_id: data.id,
        image_url: url,
      });
    })
  );

  // retorna o serviço completo com imagens
  const { data: full, error: fetchErr } = await supabase
    .from("services")
    .select("*, service_images(*)")
    .eq("id", data.id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  return full;
}
