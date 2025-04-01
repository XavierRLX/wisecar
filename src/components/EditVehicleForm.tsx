"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";
import { fetchMarcas, fetchModelos, fetchAnos, fetchDetalhesModelo } from "@/lib/fipe";
import FipeSelectors from "@/components/FipeSelectors";
import VehicleDataForm from "@/components/VehicleDataForm";
import SellerForm from "@/components/SellerForm";
import OptionalsSelect from "@/components/OptionalsSelect";
import FileUpload from "@/components/FileUpload";
import { uploadVehicleImage } from "@/hooks/useUploadImage";

export interface VehicleFormData {
  category_id: "carros" | "motos";
  marca: string;
  modelo: string;
  ano: string;
  preco: string;
  quilometragem: string;
  cor: string;
  combustivel: string;
  observacoes: string;
  vendedorTipo: "particular" | "profissional";
  nome_vendedor: string;
  telefone: string;
  empresa: string;
  redes_sociais: string;
  endereco: string;
}

interface Props {
  vehicle: Vehicle;
}

export default function EditVehicleForm({ vehicle }: Props) {
  const router = useRouter();

  // Converter fipe_info, se existir
  const initialFipeData = vehicle.fipe_info
    ? (() => {
        try {
          return typeof vehicle.fipe_info === "string"
            ? JSON.parse(vehicle.fipe_info)
            : vehicle.fipe_info;
        } catch (error) {
          console.error("Erro ao parsear fipe_info:", error);
          return null;
        }
      })()
    : null;

  // Estado do formulário usando o código completo do ano (ex: "2025-1")
  const [formData, setFormData] = useState<VehicleFormData>({
    category_id: vehicle.category_id === 1 ? "carros" : "motos",
    marca: initialFipeData?.codigoMarca || vehicle.brand,
    modelo: initialFipeData?.codigoModelo || vehicle.model,
    // NÃO divida o valor; use o código completo para que o select e a chamada à API FIPE funcionem
    ano: initialFipeData?.codigoAno || vehicle.year.toString(),
    preco: vehicle.price.toString(),
    quilometragem: vehicle.mileage.toString(),
    cor: vehicle.color,
    combustivel: vehicle.fuel,
    observacoes: vehicle.notes || "",
    vendedorTipo: vehicle.seller_details?.seller_type === "profissional" ? "profissional" : "particular",
    nome_vendedor: vehicle.seller_details?.seller_name || "",
    telefone: vehicle.seller_details?.phone || "",
    empresa: vehicle.seller_details?.company || "",
    redes_sociais: vehicle.seller_details?.social_media || "",
    endereco: vehicle.seller_details?.address || "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // Inicialmente, os opcionais selecionados estarão vazios
  const [selectedOptionals, setSelectedOptionals] = useState<number[]>([]);
  const [fipeInfo, setFipeInfo] = useState<any>(initialFipeData);

  // Carrega os opcionais disponíveis
  const [optionals, setOptionals] = useState<any[]>([]);
  useEffect(() => {
    async function loadOptionals() {
      const { data, error } = await supabase.from("optionals").select("*");
      if (error) {
        console.error("Erro ao carregar opcionais:", error.message);
      } else {
        setOptionals(data || []);
      }
    }
    loadOptionals();
  }, []);

  // Inicializa os opcionais selecionados com os opcionais já cadastrados no veículo
  useEffect(() => {
    if (vehicle && vehicle.vehicle_optionals) {
      const optionalIds = vehicle.vehicle_optionals.map((vo) => vo.optional.id);
      setSelectedOptionals(optionalIds);
    }
  }, [vehicle]);

  // Estados para FIPE selectors (listas)
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);

  // Carrega as marcas com base na categoria
  useEffect(() => {
    async function loadMarcas() {
      try {
        const data = await fetchMarcas(formData.category_id);
        setMarcas(data);
      } catch (error) {
        console.error("Erro ao carregar marcas", error);
      }
    }
    loadMarcas();
  }, [formData.category_id]);

  // Carrega os modelos com base na marca
  useEffect(() => {
    async function loadModelos() {
      if (formData.marca && !isNaN(Number(formData.marca))) {
        try {
          const data = await fetchModelos(formData.category_id, formData.marca);
          setModelos(data.modelos);
        } catch (error) {
          console.error("Erro ao carregar modelos", error);
        }
      } else {
        setModelos([]);
      }
    }
    loadModelos();
  }, [formData.marca, formData.category_id]);

  // Carrega os anos com base na marca e modelo
  useEffect(() => {
    async function loadAnos() {
      if (
        formData.marca &&
        formData.modelo &&
        !isNaN(Number(formData.marca)) &&
        !isNaN(Number(formData.modelo))
      ) {
        try {
          const data = await fetchAnos(formData.category_id, formData.marca, formData.modelo);
          setAnos(data);
        } catch (error) {
          console.error("Erro ao carregar anos", error);
        }
      } else {
        setAnos([]);
      }
    }
    loadAnos();
  }, [formData.marca, formData.modelo, formData.category_id]);

  // Atualiza as pré-visualizações das imagens
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFetchFipe() {
    if (formData.marca && formData.modelo && formData.ano) {
      try {
        const detalhes = await fetchDetalhesModelo(
          formData.category_id,
          formData.marca,
          formData.modelo,
          formData.ano
        );
        const fipeData = {
          ...detalhes,
          codigoMarca: formData.marca,
          codigoModelo: formData.modelo,
          codigoAno: formData.ano,
        };
        setFipeInfo(fipeData);
      } catch (error) {
        console.error("Erro ao buscar detalhes FIPE", error);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

     // Converte os códigos para os nomes correspondentes, usando as listas carregadas
  const brandName =
  marcas.find((m) => m.codigo === formData.marca)?.nome || formData.marca;
const modelName =
  modelos.find((mod) => String(mod.codigo) === formData.modelo)?.nome ||
  formData.modelo;

// Se o código do ano estiver no formato "2025-1", extraímos apenas a parte numérica
const yearValue = formData.ano.includes("-")
  ? parseInt(formData.ano.split("-")[0])
  : parseInt(formData.ano);

// Atualiza os dados principais do veículo, salvando os nomes em vez dos códigos
const { error } = await supabase
  .from("vehicles")
  .update({
    brand: brandName,
    model: modelName,
    year: yearValue,
    price: parseFloat(formData.preco),
    mileage: parseInt(formData.quilometragem),
    color: formData.cor,
    fuel: formData.combustivel,
    notes: formData.observacoes,
    fipe_info: fipeInfo ? JSON.stringify(fipeInfo) : null,
  })
  .eq("id", vehicle.id);

    // Atualiza ou insere os detalhes do vendedor
    const { error: sellerError } = await supabase
  .from("seller_details")
  .upsert(
    {
      vehicle_id: vehicle.id,
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
  console.error("Erro ao atualizar detalhes do vendedor:", sellerError.message);
  return;
}


   // Atualiza os opcionais: remove os antigos e insere os novos
const { error: deleteError } = await supabase
.from("vehicle_optionals")
.delete()
.eq("vehicle_id", vehicle.id);
if (deleteError) {
console.error("Erro ao excluir opcionais antigos:", deleteError.message);
return;
}
if (selectedOptionals.length > 0) {
const rows = selectedOptionals.map((optionalId) => ({
  vehicle_id: vehicle.id,
  optional_id: optionalId,
}));
const { error: insertOptError } = await supabase
  .from("vehicle_optionals")
  .upsert(rows, { onConflict: "vehicle_id, optional_id" });
if (insertOptError) {
  console.error("Erro ao inserir opcionais:", insertOptError.message);
  return;
}
}

    

    // Atualiza imagens, se necessário
    if (selectedFiles.length > 0) {
      await Promise.all(
        selectedFiles.map(async (file) => {
          const publicUrl = await uploadVehicleImage(vehicle.id, file);
          if (!publicUrl) {
            console.error("Erro no upload da imagem:", file.name);
          }
        })
      );
    }

    router.push(`/veiculos/${vehicle.id}`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto m-4 bg-white shadow rounded">
      <h1 className="text-3xl font-bold mb-6 text-center">Editar Veículo</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FIPE Selectors */}
        <FipeSelectors
          category={formData.category_id}
          marca={formData.marca}
          modelo={formData.modelo}
          ano={formData.ano}
          marcas={marcas}
          modelos={modelos}
          anos={anos}
          onChange={handleChange}
          onFetchFipe={handleFetchFipe}
        />
        {/* Vehicle Data */}
        <VehicleDataForm
          preco={formData.preco}
          quilometragem={formData.quilometragem}
          cor={formData.cor}
          combustivel={formData.combustivel}
          observacoes={formData.observacoes}
          onChange={handleChange}
        />
        {/* Seller Details */}
        <SellerForm
          sellerType={formData.vendedorTipo}
          sellerName={formData.nome_vendedor}
          phone={formData.telefone}
          company={formData.empresa}
          socialMedia={formData.redes_sociais}
          address={formData.endereco}
          onChange={handleChange}
        />
        {/* Opcionais */}
        <OptionalsSelect
          optionals={optionals}
          selectedOptionals={selectedOptionals}
          onToggleOptional={(id) =>
            setSelectedOptionals((prev) =>
              prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
            )
          }
        />
        {/* File Upload */}
        <FileUpload
          previewUrls={previewUrls}
          onFileChange={(e) => {
            if (e.target.files) {
              const files = Array.from(e.target.files);
              setSelectedFiles(files);
            }
          }}
          onRemoveFile={(index) =>
            setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
          }
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Salvar Alterações
        </button>
        <button
  type="button"
  onClick={() => router.push(`/veiculos/${vehicle.id}`)}
  className="w-full py-3 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
>
  Cancelar
</button>
      </form>
    </div>
  );
}
