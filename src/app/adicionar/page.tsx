"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import {
  fetchMarcas,
  fetchModelos,
  fetchAnos,
  fetchDetalhesModelo,
} from "@/lib/fipe";

// Componentes modulares modernizados
import FipeSelectors from "@/components/FipeSelectors";
import VehicleDataForm from "@/components/VehicleDataForm";
import SellerForm from "@/components/SellerForm";
import OptionalsSelect from "@/components/OptionalsSelect";
import FileUpload from "@/components/FileUpload";

// Serviço para submeter os dados do veículo
import { submitVehicleData } from "@/lib/vehicleService";

interface VehicleFormData {
  category_id: "carros" | "motos";
  is_for_sale: boolean ;
  marca: string;
  modelo: string;
  ano: string;
  fipe_info?: string;
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

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<VehicleFormData>({
    category_id: "carros",
    is_for_sale: true,
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
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
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

  // Busca detalhes FIPE para o ano selecionado
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleToggleOptional(id: number) {
    setSelectedOptionals((prev) =>
      prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Obtém o usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Envia os dados do veículo
      await submitVehicleData(
        user,
        formData,
        fipeInfo,
        marcas,
        modelos,
        selectedFiles,
        selectedOptionals
      );
      router.push("/veiculos");
    } catch (error: any) {
      console.error("Erro:", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-4">
            <label className="block font-medium mb-1">Tipo de veículo</label>
            <select
              name="is_for_sale"
              value={String(formData.is_for_sale)}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  is_for_sale: e.target.value === "true",
                }))
              }
              className="border rounded px-2 py-1"
            >
              <option value="true">Desejado</option>
              <option value="false">Minha Garagem</option>
            </select>
          </div>
        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
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
              <div className="p-4 bg-gray-100 rounded-lg">
                <p>
                  <span className="font-semibold">Valor FIPE:</span> {fipeInfo.Valor}
                </p>
                <p>
                  <span className="font-semibold">Data de Referência:</span> {fipeInfo.MesReferencia}
                </p>
              </div>
            )}

            {/* Dados do Veículo */}
            <VehicleDataForm
              preco={formData.preco}
              quilometragem={formData.quilometragem}
              cor={formData.cor}
              combustivel={formData.combustivel}
              observacoes={formData.observacoes}
              onChange={handleChange}
            />

            {/* Dados do Vendedor */}
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
              onToggleOptional={handleToggleOptional}
            />

            {/* Upload de Arquivos */}
            <FileUpload
              previewUrls={previewUrls}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bkgColorPrimary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {loading ? "Salvando..." : "Adicionar Veículo"}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
