import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/hooks/useUploadImage";
import type { Provider, Service } from "@/types";

export async function fetchProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from("service_providers")
    .select("*, provider_images(*), services(service_images(*))");
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchProviderById(id: string): Promise<Provider> {
  const { data, error } = await supabase
    .from("service_providers")
    .select("*, provider_images(*), services(service_images(*))")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function submitProviderData(
  userId: string,
  form: { name: string; address: string; description: string },
  files: File[]
): Promise<Provider> {
  // 1) insere a loja
  const { data, error } = await supabase
    .from("service_providers")
    .insert({ user_id: userId, ...form })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // 2) faz upload das imagens da loja
  await Promise.all(
    files.map(async (file) => {
      const url = await uploadImage("provider-images", "providers", data.id, file);
      if (!url) throw new Error("Falha no upload da imagem: " + file.name);
      await supabase.from("provider_images").insert({
        provider_id: data.id,
        image_url: url,
      });
    })
  );

  return fetchProviderById(data.id);
}

export async function submitServiceData(
  providerId: string,
  form: { name: string; details: string; price: number },
  files: File[]
): Promise<Service> {
  // 1) insere o serviço
  const { data, error } = await supabase
    .from("services")
    .insert({ provider_id: providerId, ...form })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // 2) faz upload das imagens do serviço
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

  // 3) retorna o mesmo serviço com imagens
  const { data: full, error: fetchErr } = await supabase
    .from("services")
    .select("*, service_images(*)")
    .eq("id", data.id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  return full;
}
