// hooks/useUploadImage.ts
"use client";

import { supabase } from "@/lib/supabase";

/**
 * Faz o upload da imagem para o bucket "vehicle-images", obtém a URL pública
 * e insere um registro na tabela "vehicle_images".
 * Retorna a URL pública ou null em caso de erro.
 */
export async function uploadVehicleImage(
  vehicleId: string,
  file: File
): Promise<string | null> {
  const filePath = `vehicles/${vehicleId}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("vehicle-images")
    .upload(filePath, file);
  if (uploadError) {
    console.error("Erro ao fazer upload da imagem:", uploadError.message);
    return null;
  }

  const { data } = supabase.storage
    .from("vehicle-images")
    .getPublicUrl(filePath);
  const publicUrl = data.publicUrl;
  if (!publicUrl) {
    console.error("Erro ao obter URL pública. Verifique as configurações do bucket e o filePath.");
    return null;
  }

  const { error: insertImageError } = await supabase
    .from("vehicle_images")
    .insert({
      vehicle_id: vehicleId,
      image_url: publicUrl,
    });
  if (insertImageError) {
    console.error("Erro ao inserir imagem:", insertImageError.message);
    return null;
  }

  return publicUrl;
}

/**
 * Faz o upload genérico de um arquivo para o bucket, dentro de uma "pasta" e subpasta com o recordId.
 * Retorna a URL pública ou null em caso de erro.
 *
 * @param bucket - nome do bucket no Supabase Storage (ex: "provider-images", "service-item-images", "maintenance-docs")
 * @param folder - nome da "pasta" dentro do bucket (ex: "providers-logo", "gallery", "docs")
 * @param recordId - id da entidade a que o arquivo pertence
 * @param file     - o File vindo do input
 */
export async function uploadImage(
  bucket: string,
  folder: string,
  recordId: string,
  file: File
): Promise<string | null> {
  const filePath = `${folder}/${recordId}/${file.name}`;

  // faz o upload
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  if (uploadError) {
    console.error(`Upload falhou no bucket "${bucket}":`, uploadError.message);
    return null;
  }

  // gera a URL pública
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (!data.publicUrl) {
    console.error(`Não foi possível obter publicUrl para "${filePath}" no bucket "${bucket}".`);
    return null;
  }

  return data.publicUrl;
}

/**
 * Faz o upload de um documento de manutenção para o bucket "maintenance-docs",
 * dentro da pasta "docs/<recordId>".
 * Retorna a URL pública ou null em caso de erro.
 */
export async function uploadMaintenanceDoc(
  recordId: string,
  file: File
): Promise<string | null> {
  return uploadImage("maintenance-docs", "docs", recordId, file);
}
