"use client";
import { supabase } from "@/lib/supabase";

/**
 * Faz o upload da imagem para o bucket "vehicle-images", obtém a URL pública e insere um registro na tabela "vehicle_images".
 * Retorna a URL pública ou null em caso de erro.
 */

export async function uploadVehicleImage(
  vehicleId: string,
  file: File
): Promise<string | null> {
  // Define o caminho do arquivo no bucket
  const filePath = `vehicles/${vehicleId}/${file.name}`;
  
  // Realiza o upload
  const { error: uploadError } = await supabase.storage
    .from("vehicle-images")
    .upload(filePath, file);
  if (uploadError) {
    console.error("Erro ao fazer upload da imagem:", uploadError.message);
    return null;
  }
  
  // Obtém a URL pública (getPublicUrl é síncrono)
  const { data } = supabase.storage
    .from("vehicle-images")
    .getPublicUrl(filePath);
  const publicUrl = data.publicUrl;
  if (!publicUrl) {
    console.error("Erro ao obter URL pública. Verifique as configurações do bucket e o filePath.");
    return null;
  }
  
  // Insere o registro na tabela "vehicle_images"
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

export async function uploadImage(
  bucket: string,       // ex: "provider-images" ou "service-item-images"
  folder: string,       // ex: "providers-logo", "gallery", "service-items"
  recordId: string,
  file: File
): Promise<string | null> {
  // monta só a parte da pasta + id + nome do arquivo
  const filePath = `${folder}/${recordId}/${file.name}`;

  // faz o upload
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  if (uploadError) {
    console.error("Upload falhou:", uploadError.message);
    return null;
  }

  // gera a URL pública
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl || null;
}

