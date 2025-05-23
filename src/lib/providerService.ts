import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/hooks/useUploadImage";
import type { Provider, Service } from "@/types";

// Fetch de todas as lojas com serviços e itens
export async function fetchProviders(filters?: {
  categoryId?: number;
  state?: string;
  city?: string;
  neighborhood?: string;
  search?: string;
}): Promise<Provider[]> {
  let query = supabase
    .from("service_providers")
    .select(
      `*,
      provider_images(*),
      services(
        id,
        provider_id,
        category_id,
        name,
        created_at,
        service_items(*, service_item_images(*))
      ),
      service_provider_categories!inner(category:service_categories(name))`
    );

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

// Fetch individual de uma loja
export async function fetchProviderById(id: string): Promise<Provider> {
  const { data, error } = await supabase
    .from("service_providers")
    .select(
      `*,
      provider_images(*),
      services(
        id,
        provider_id,
        category_id,
        name,
        created_at,
        service_items(*, service_item_images(*))
      ),
      service_provider_categories!inner(category:service_categories(name))`
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Criação de loja com logo e galeria
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
  logoFile: File | null,
  galleryFiles: File[]
): Promise<Provider> {
  // 1️⃣ Cria a loja
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

  // 2️⃣ Upload do logo
  if (logoFile) {
    const logoUrl = await uploadImage(
      "provider-images",
      "providers-logo",
      provider.id,
      logoFile
    );
    if (!logoUrl) throw new Error("Falha no upload do logo");
    await supabase
      .from("service_providers")
      .update({ logo_url: logoUrl })
      .eq("id", provider.id);
  }

  // 3️⃣ Vincula categorias
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

  // 4️⃣ Upload da galeria extra
  await Promise.all(
    galleryFiles.map(async (file) => {
      const url = await uploadImage(
        "provider-images",
        "providers",
        provider.id,
        file
      );
      if (!url) throw new Error(`Falha no upload da galeria: ${file.name}`);
      await supabase.from("provider_images").insert({
        provider_id: provider.id,
        image_url: url,
      });
    })
  );

  return fetchProviderById(provider.id);
}

// Criação de serviço + itens + imagens de itens
export async function submitServiceData(
  providerId: string,
  form: {
    name: string;
    categoryId: number;
    items: { name: string; details: string; price: number; files: File[] }[];
  }
): Promise<Service> {
  // 1️⃣ Cria o serviço (sem price/details)
  const { data: svc, error: svcErr } = await supabase
    .from("services")
    .insert({
      provider_id: providerId,
      name: form.name,
      category_id: form.categoryId,
    })
    .select()
    .single();
  if (svcErr) throw new Error(svcErr.message);

  // 2️⃣ Para cada item, cria e faz upload
  await Promise.all(
    form.items.map(async (item) => {
      const { data: it, error: itErr } = await supabase
        .from("service_items")
        .insert({
          service_id: svc.id,
          name: item.name,
          details: item.details,
          price: item.price,
        })
        .select()
        .single();
      if (itErr) throw new Error(itErr.message);

      await Promise.all(
        item.files.map(async (file) => {
          const url = await uploadImage(
            "service-item-images",
            "service-items",
            it.id,
            file
          );
          if (!url) throw new Error(`Falha no upload do item: ${file.name}`);
          await supabase.from("service_item_images").insert({
            service_item_id: it.id,
            image_url: url,
          });
        })
      );
    })
  );

  // 3️⃣ Retorna o serviço completo
  const { data: full, error: fullErr } = await supabase
    .from("services")
    .select(`
      id,
      provider_id,
      category_id,
      name,
      created_at,
      service_items(*, service_item_images(*))
    `)
    .eq("id", svc.id)
    .single();
  if (fullErr) throw new Error(fullErr.message);
  return full;
}