// lib/vehicleService.ts
import { supabase } from "@/lib/supabase";
import { uploadVehicleImage } from "@/hooks/useUploadImage";

export async function submitVehicleData(
  user: any, // ou defina o tipo correto de usuário, se houver
  formData: any,
  fipeInfo: any,
  marcas: any[],
  modelos: any[],
  selectedFiles: File[],
  selectedOptionals: number[]
) {
  // Mapeia os códigos para os respectivos nomes
  const brandName =
    marcas.find((m) => m.codigo === formData.marca)?.nome || formData.marca;
  const modelName =
    modelos.find((mod) => String(mod.codigo) === formData.modelo)?.nome ||
    formData.modelo;

  // Monta os dados do veículo
  const vehicleData = {
    user_id: user.id,
    category_id: formData.category_id === "carros" ? 1 : 2,
    fipe_info: fipeInfo ? JSON.stringify(fipeInfo) : null,
    brand: brandName,
    model: modelName,
    year: formData.ano ? parseInt(formData.ano.split("-")[0]) : null,
    price: parseFloat(formData.preco),
    mileage: parseInt(formData.quilometragem),
    color: formData.cor,
    fuel: formData.combustivel,
    notes: formData.observacoes,
  };

  // Insere o veículo na tabela "vehicles"
  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicleData)
    .select();
  if (error) {
    throw new Error("Erro ao adicionar veículo: " + error.message);
  }
  const insertedVehicle = data[0];

  // Upload das imagens, se houver
  if (selectedFiles.length > 0) {
    await Promise.all(
      selectedFiles.map(async (file) => {
        const publicUrl = await uploadVehicleImage(insertedVehicle.id, file);
        if (!publicUrl) {
          throw new Error("Erro no upload da imagem: " + file.name);
        }
      })
    );
  }

  // Insere os dados do vendedor na tabela "seller_details"
  const sellerData = {
    vehicle_id: insertedVehicle.id,
    seller_type: formData.vendedorTipo,
    seller_name: formData.nome_vendedor,
    phone: formData.telefone,
    company: formData.empresa,
    social_media: formData.redes_sociais,
    address: formData.endereco,
  };
  const { error: sellerError } = await supabase
    .from("seller_details")
    .insert(sellerData);
  if (sellerError) {
    throw new Error(
      "Erro ao inserir detalhes do vendedor: " + sellerError.message
    );
  }

  // Insere os opcionais selecionados na tabela "vehicle_optionals"
  if (selectedOptionals.length > 0) {
    const rows = selectedOptionals.map((optionalId) => ({
      vehicle_id: insertedVehicle.id,
      optional_id: optionalId,
    }));
    const { error: optError } = await supabase
      .from("vehicle_optionals")
      .insert(rows);
    if (optError) {
      throw new Error("Erro ao inserir opcionais: " + optError.message);
    }
  }

  return insertedVehicle;
}
