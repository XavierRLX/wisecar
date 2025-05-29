import { supabase } from "@/lib/supabase";
import { uploadVehicleImage } from "@/hooks/useUploadImage";
import { VehicleStatus } from "@/types";

// formData.status: 'WISHLIST' | 'GARAGE' | 'FOR_SALE'
export async function submitVehicleData(
  user: any,
  formData: any,
  fipeInfo: any,
  marcas: { codigo: string; nome: string }[],
  modelos: { codigo: number | string; nome: string }[],
  selectedFiles: File[],
  selectedOptionals: number[]
) {
  // 1) Convertemos o código de marca → nome de marca
  const brandName =
    marcas.find((m) => String(m.codigo) === formData.marca)?.nome ||
    formData.marca;

  // 2) Convertemos o código de modelo → nome de modelo
  const modelName =
    modelos.find((m) => String(m.codigo) === String(formData.modelo))
      ?.nome || formData.modelo;

  // 3) Parseamos FIPE e preço de venda
  const fipePrice = parseFloat(formData.preco);
  const salePrice = formData.status === "FOR_SALE" ? fipePrice : null;

  // 4) Montamos o objeto que vai de verdade para o Supabase
  const vehicleData = {
    user_id: user.id,
    owner_id:
      formData.status === "WISHLIST"
        ? null
        : user.id,
    status: formData.status as VehicleStatus,
    category_id: formData.category_id === "carros" ? 1 : 2,

    fipe_info: fipeInfo ? JSON.stringify(fipeInfo) : null,
    fipe_price: fipePrice,
    sale_price: salePrice,

    // **Aqui** garantimos que enviamos o texto, não o código
    brand: brandName,
    model: modelName,

    year: formData.ano ? parseInt(formData.ano.split("-")[0]) : null,
    mileage: parseInt(formData.quilometragem),
    color: formData.cor,
    fuel: formData.combustivel,
    notes: formData.observacoes,
  };

  // 5) Inserção no Supabase
  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicleData)
    .select();
  if (error) throw new Error("Erro ao adicionar veículo: " + error.message);
  const insertedVehicle = data![0];

  // 6) Upload das imagens
  if (selectedFiles.length) {
    await Promise.all(
      selectedFiles.map((file) =>
        uploadVehicleImage(insertedVehicle.id, file).then((url) => {
          if (!url) throw new Error("Erro no upload da imagem: " + file.name);
        })
      )
    );
  }

  // 7) Detalhes do vendedor
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
    throw new Error(
      "Erro ao inserir detalhes do vendedor: " + sellerError.message
    );

  // 8) Opcionais
  if (selectedOptionals.length) {
    const rows = selectedOptionals.map((optId) => ({
      vehicle_id: insertedVehicle.id,
      optional_id: optId,
    }));
    const { error: optError } = await supabase
      .from("vehicle_optionals")
      .insert(rows);
    if (optError)
      throw new Error("Erro ao inserir opcionais: " + optError.message);
  }

  return insertedVehicle;
}
export async function updateVehicleData(
  vehicleId: string,
  formData: any,
  marcas: { codigo: string; nome: string }[],
  modelos: { codigo: number | string; nome: string }[],
  fipeInfo: any,
  selectedFiles: File[],
  selectedOptionals: number[]
): Promise<boolean> {
  // 1) Obter usuário atual
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  // 2) Converter código FIPE → nome
  const brandName =
    marcas.find((m) => String(m.codigo) === String(formData.marca))?.nome ??
    formData.marca;
  const modelName =
    modelos.find((m) => String(m.codigo) === String(formData.modelo))?.nome ??
    formData.modelo;

  // 3) Parse de preços e ano
  const fipePrice = parseFloat(formData.preco);
  const salePrice = formData.status === "FOR_SALE" ? fipePrice : null;
  const yearValue = formData.ano.includes("-")
    ? parseInt(formData.ano.split("-")[0], 10)
    : parseInt(formData.ano, 10);

  // 4) Montar payload de atualização
  const updates = {
    status: formData.status as VehicleStatus,
    owner_id: formData.status === "WISHLIST" ? null : user.id,
    fipe_price: fipePrice,
    sale_price: salePrice,

    brand: brandName,
    model: modelName,
    year: yearValue,
    mileage: parseInt(formData.quilometragem, 10),
    color: formData.cor,
    fuel: formData.combustivel,
    notes: formData.observacoes,
    fipe_info: fipeInfo ? JSON.stringify(fipeInfo) : null,
  };

  // 5) Atualizar registro na tabela vehicles
  const { error: updateError } = await supabase
    .from("vehicles")
    .update(updates)
    .eq("id", vehicleId);
  if (updateError) {
    throw new Error("Erro ao atualizar veículo: " + updateError.message);
  }

  // 6) Upsert nos detalhes do vendedor
  const { error: sellerError } = await supabase
    .from("seller_details")
    .upsert(
      {
        vehicle_id: vehicleId,
        seller_type: formData.vendedorTipo,
        seller_name: formData.nome_vendedor,
        phone: formData.telefone,
        company: formData.empresa,
        social_media: formData.redes_sociais,
        address: formData.endereco,
      },
      { onConflict: "vehicle_id" }
    );
  if (sellerError) {
    throw new Error(
      "Erro ao atualizar detalhes do vendedor: " + sellerError.message
    );
  }

  // 7) Atualizar opcionais: limpar antigos e inserir novos
  const { error: deleteError } = await supabase
    .from("vehicle_optionals")
    .delete()
    .eq("vehicle_id", vehicleId);
  if (deleteError) {
    throw new Error(
      "Erro ao excluir opcionais antigos: " + deleteError.message
    );
  }
  if (selectedOptionals.length > 0) {
    const rows = selectedOptionals.map((optId) => ({
      vehicle_id: vehicleId,
      optional_id: optId,
    }));
    const { error: insertOptError } = await supabase
      .from("vehicle_optionals")
      .insert(rows);
    if (insertOptError) {
      throw new Error(
        "Erro ao inserir opcionais: " + insertOptError.message
      );
    }
  }

  // 8) Fazer upload de novas imagens (se houver)
  if (selectedFiles.length > 0) {
    await Promise.all(
      selectedFiles.map(async (file) => {
        const publicUrl = await uploadVehicleImage(vehicleId, file);
        if (!publicUrl) {
          throw new Error("Erro no upload da imagem: " + file.name);
        }
      })
    );
  }

  return true;
}