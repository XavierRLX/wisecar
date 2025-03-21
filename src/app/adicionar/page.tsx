"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import { uploadVehicleImage } from "@/hooks/useUploadImage";
import {
  fetchMarcas,
  fetchModelos,
  fetchAnos,
  fetchDetalhesModelo,
} from "@/lib/fipe";

// Importa os componentes modulares (crie estes arquivos conforme os exemplos fornecidos)
import FipeSelectors from "@/components/FipeSelectors";
import VehicleDataForm from "@/components/VehicleDataForm";
import SellerForm from "@/components/SellerForm";
import OptionalsSelect from "@/components/OptionalsSelect";
import FileUpload from "@/components/FileUpload";

interface VehicleFormData {
  category_id: "carros" | "motos";
  // Campos FIPE (para o formulário em português)
  marca: string;         // Código da marca (FIPE)
  modelo: string;        // Código do modelo (FIPE)
  ano: string;           // Código do ano (FIPE) – ex: "2014-3"
  fipe_info?: string;    // Dados FIPE completos (JSON)
  // Dados informados pelo usuário
  preco: string;
  quilometragem: string;
  cor: string;
  combustivel: string;
  observacoes: string;
  // Dados de contato do vendedor
  vendedorTipo: "particular" | "profissional";
  nome_vendedor: string;
  telefone: string;
  empresa: string;
  redes_sociais: string;
  endereco: string;
}

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<VehicleFormData>({
    category_id: "carros",
    marca: "",
    modelo: "",
    ano: "",
    fipe_info: "",
    preco: "",
    quilometragem: "",
    cor: "",
    combustivel: "",
    observacoes: "",
    vendedorTipo: "particular",
    nome_vendedor: "",
    telefone: "",
    empresa: "",
    redes_sociais: "",
    endereco: "",
  });
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);
  const [fipeInfo, setFipeInfo] = useState<any>(null);
  const [optionals, setOptionals] = useState<any[]>([]);
  const [selectedOptionals, setSelectedOptionals] = useState<number[]>([]);

  // Atualiza as pré-visualizações das imagens
  useEffect(() => {
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  // Carrega as marcas via API FIPE conforme a categoria
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

  // Carrega os modelos conforme a marca selecionada
  useEffect(() => {
    async function loadModelos() {
      if (formData.marca) {
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

  // Carrega os anos disponíveis conforme marca e modelo
  useEffect(() => {
    async function loadAnos() {
      if (formData.marca && formData.modelo) {
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

  // Carrega os opcionais do banco
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

  // Função para buscar detalhes FIPE para o ano selecionado
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert("Você pode selecionar no máximo 5 imagens.");
        setSelectedFiles(files.slice(0, 5));
      } else {
        setSelectedFiles(files);
      }
    }
  }

  function handleRemoveFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  function handleToggleOptional(id: number) {
    setSelectedOptionals(prev =>
      prev.includes(id) ? prev.filter(opt => opt !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
  
    // Obtém o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
  
    // Mapeia o código da marca e do modelo para os respectivos nomes
    const brandName = marcas.find((m) => m.codigo === formData.marca)?.nome || formData.marca;
    const modelName = modelos.find(mod => String(mod.codigo) === formData.modelo)?.nome || formData.modelo;
  
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
    const { data, error } = await supabase.from("vehicles").insert(vehicleData).select();
    if (error) {
      console.error("Erro ao adicionar veículo:", error.message);
      setLoading(false);
      return;
    }
    const insertedVehicle = data[0];

    // Faz o upload das imagens, se houver
    if (selectedFiles.length > 0) {
      await Promise.all(
        selectedFiles.map(async file => {
          const publicUrl = await uploadVehicleImage(insertedVehicle.id, file);
          if (!publicUrl) {
            console.error("Erro no upload da imagem para", file.name);
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
    const { error: sellerError } = await supabase.from("seller_details").insert(sellerData);
    if (sellerError) {
      console.error("Erro ao inserir detalhes do vendedor:", sellerError.message);
    }

    // Insere os opcionais selecionados na tabela de relação "vehicle_optionals"
    if (selectedOptionals.length > 0) {
      const rows = selectedOptionals.map(optionalId => ({
        vehicle_id: insertedVehicle.id,
        optional_id: optionalId,
      }));
      const { error: optError } = await supabase.from("vehicle_optionals").insert(rows);
      if (optError) {
        console.error("Erro ao inserir opcionais:", optError.message);
      }
    }

    setLoading(false);
    router.push("/veiculos");
  }

  return (
    <AuthGuard>
      <div className="p-8 max-w-4xl m-4 mx-auto bg-white shadow rounded">
        <h1 className="text-3xl font-bold mb-6 text-center">Adicionar Veículo</h1>
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

          {fipeInfo && (
            <div className="p-4 bg-gray-100 rounded">
              <p>
                <strong>Valor FIPE:</strong> {fipeInfo.Valor}
              </p>
              <p>
                <strong>Data de Referência:</strong> {fipeInfo.MesReferencia}
              </p>
            </div>
          )}

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

          {/* Optionals */}
          <OptionalsSelect
            optionals={optionals}
            selectedOptionals={selectedOptionals}
            onToggleOptional={handleToggleOptional}
          />

          {/* File Upload */}
          <FileUpload
            previewUrls={previewUrls}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "Salvando..." : "Adicionar Veículo"}
          </button>
        </form>
        <div className="mb-4"></div>
      </div>
    </AuthGuard>
  );
}
