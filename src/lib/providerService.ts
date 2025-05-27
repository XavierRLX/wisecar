// lib/providerService.ts
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/hooks/useUploadImage";
import type { Provider, Service, ServiceCategory } from "@/types";

type RawService = Omit<Service, "category"> & {
  category: ServiceCategory[];
};

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
    .select(`
      *,
      provider_images(*),
      services(
        id,
        provider_id,
        category_id,
        price,
        name,
        created_at,
        service_items(
          *,
          item_images:service_item_images(*)
        ),
        category:service_categories(id,name)
      )
    `);

  if (filters?.categoryId) {
    query = query.eq("services.category_id", filters.categoryId);
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
  if (!data) return [];

  // transforma RawService.category: ServiceCategory[] → ServiceCategory
  const providers = (data as any[]).map((p) => ({
    ...p,
    services: (p.services as RawService[]).map((svc) => ({
      ...svc,
      category: svc.category[0] as ServiceCategory,
    })),
  }));

  return providers as Provider[];
}

// Fetch individual de uma loja
export async function fetchProviderById(id: string): Promise<Provider> {
  const { data, error } = await supabase
    .from("service_providers")
    .select(`
      *,
      provider_images(*),
      services(
        id,
        provider_id,
        category_id,
        price,
        name,
        created_at,
        service_items(
          *,
          item_images:service_item_images(*)
        ),
        category:service_categories(id,name)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Loja não encontrada");

  // mapeia cada serviço para category único
  const mappedServices = (data.services as RawService[]).map((svc) => ({
    ...svc,
    category: svc.category[0] as ServiceCategory,
  }));

  return {
    ...data,
    services: mappedServices,
  } as Provider;
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
  },
  logoFile: File | null,
  galleryFiles: File[]
): Promise<Provider> {
  // 1️⃣ cria a loja
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

  // 3️⃣ Upload da galeria extra
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

// Criação de serviço + preço + itens + imagens de itens
export async function submitServiceData(
  providerId: string,
  form: {
    name: string;
    categoryId: number;
    price: number;
    items: { name: string; details: string; price: number; files: File[] }[];
  }
): Promise<Service> {
  // 1️⃣ cria o serviço com preço
  const { data: svc, error: svcErr } = await supabase
    .from("services")
    .insert({
      provider_id: providerId,
      name: form.name,
      category_id: form.categoryId,
      price: form.price,
    })
    .select()
    .single();
  if (svcErr) throw new Error(svcErr.message);

  // 2️⃣ cria itens e faz upload das imagens
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

  // 3️⃣ retorna o serviço completo
  const { data: full, error: fullErr } = await supabase
    .from("services")
    .select(`
      id,
      provider_id,
      category_id,
      price,
      name,
      created_at,
      service_items(
        *,
        item_images:service_item_images(*)
      ),
      category:service_categories(id,name)
    `)
    .eq("id", svc.id)
    .single();
  if (fullErr) throw new Error(fullErr.message);
  if (!full) throw new Error("Erro ao buscar serviço recém-criado");

  // mapeia category array → objeto único
  const result: Service = {
    ...full,
    category: (full.category as ServiceCategory[])[0],
  };

  return result;
}
