import { supabase } from "@/lib/supabase";
import { uploadVehicleImage } from "@/hooks/useUploadImage";
import { VehicleStatus } from "@/types";

// formData.status: 'WISHLIST' | 'GARAGE' | 'FOR_SALE'
export async function submitVehicleData(
  user: any,
  formData: any,
  fipeInfo: any,
  marcas: any[],
  modelos: any[],
  selectedFiles: File[],
  selectedOptionals: number[]
) {
  const brandName =
    marcas.find((m) => m.codigo === formData.marca)?.nome || formData.marca;
  const modelName =
    modelos.find((mod) => String(mod.codigo) === formData.modelo)?.nome ||
    formData.modelo;

  const fipePrice = parseFloat(formData.preco);
  const salePrice = formData.status === "FOR_SALE" ? fipePrice : null;

  const vehicleData = {
    user_id: user.id,
    owner_id: formData.status === "WISHLIST" ? null : user.id,
    status: formData.status as VehicleStatus,
    category_id: formData.category_id === "carros" ? 1 : 2,
    fipe_info: fipeInfo ? JSON.stringify(fipeInfo) : null,
    fipe_price: fipePrice,
    sale_price: salePrice,

    brand: brandName,
    model: modelName,
    year: formData.ano ? parseInt(formData.ano.split("-")[0]) : null,
    mileage: parseInt(formData.quilometragem),
    color: formData.cor,
    fuel: formData.combustivel,
    notes: formData.observacoes,
  };

  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicleData)
    .select();
  if (error) throw new Error("Erro ao adicionar veículo: " + error.message);
  const insertedVehicle = data![0];

  if (selectedFiles.length) {
    await Promise.all(
      selectedFiles.map((file) =>
        uploadVehicleImage(insertedVehicle.id, file).then((url) => {
          if (!url) throw new Error("Erro no upload da imagem: " + file.name);
        })
      )
    );
  }

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
  if (sellerError)
    throw new Error("Erro ao inserir detalhes do vendedor: " + sellerError.message);

  if (selectedOptionals.length) {
    const rows = selectedOptionals.map((optId) => ({
      vehicle_id: insertedVehicle.id,
      optional_id: optId,
    }));
    const { error: optError } = await supabase
      .from("vehicle_optionals")
      .insert(rows);
    if (optError) throw new Error("Erro ao inserir opcionais: " + optError.message);
  }

  return insertedVehicle;
}

export async function updateVehicleData(
  vehicleId: string,
  formData: any,
  selectedFiles: File[],
  selectedOptionals: number[]
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fipePrice = parseFloat(formData.preco);
  const salePrice = formData.status === "FOR_SALE" ? fipePrice : null;
  const ownerId = formData.status === "WISHLIST" ? null : user?.id;

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({
      status: formData.status as VehicleStatus,
      owner_id: ownerId,
      fipe_price: fipePrice,
      sale_price: salePrice,

      brand: formData.marca,
      model: formData.modelo,
      year: parseInt(formData.ano),
      mileage: parseInt(formData.quilometragem),
      color: formData.cor,
      fuel: formData.combustivel,
      notes: formData.observacoes,
    })
    .eq("id", vehicleId);
  if (updateError) throw new Error("Erro ao atualizar veículo: " + updateError.message);

  const { error: sellerError } = await supabase
    .from("seller_details")
    .upsert({
      vehicle_id: vehicleId,
      seller_type: formData.vendedorTipo,
      seller_name: formData.nome_vendedor,
      phone: formData.telefone,
      company: formData.empresa,
      social_media: formData.redes_sociais,
      address: formData.endereco,
    });
  if (sellerError)
    throw new Error("Erro ao atualizar detalhes do vendedor: " + sellerError.message);

  await supabase.from("vehicle_optionals").delete().eq("vehicle_id", vehicleId);
  if (selectedOptionals.length) {
    const rows = selectedOptionals.map((optId) => ({
      vehicle_id: vehicleId,
      optional_id: optId,
    }));
    const { error: optError } = await supabase
      .from("vehicle_optionals")
      .insert(rows);
    if (optError) throw new Error("Erro ao inserir opcionais: " + optError.message);
  }

  if (selectedFiles.length) {
    await Promise.all(
      selectedFiles.map((file) =>
        uploadVehicleImage(vehicleId, file).then((url) => {
          if (!url) throw new Error("Erro no upload da imagem: " + file.name);
        })
      )
    );
  }

  return true;
}
