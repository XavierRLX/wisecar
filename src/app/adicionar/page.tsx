// app/adicionar/page.tsx
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

import FipeSelectors from "@/components/FipeSelectors";
import VehicleDataForm from "@/components/VehicleDataForm";
import SellerForm from "@/components/SellerForm";
import OptionalsSelect from "@/components/OptionalsSelect";
import FileUpload from "@/components/FileUpload";

import { submitVehicleData } from "@/lib/vehicleService";

interface VehicleFormData {
  category_id: "carros" | "motos";
  is_for_sale: boolean;
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

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  useEffect(() => {
    async function loadMarcas() {
      try {
        const data = await fetchMarcas(formData.category_id);
        setMarcas(data);
      } catch {
        console.error("Erro ao carregar marcas");
      }
    }
    loadMarcas();
  }, [formData.category_id]);

  useEffect(() => {
    async function loadModelos() {
      if (!formData.marca) return setModelos([]);
      try {
        const data = await fetchModelos(formData.category_id, formData.marca);
        setModelos(data.modelos);
      } catch {
        console.error("Erro ao carregar modelos");
      }
    }
    loadModelos();
  }, [formData.marca, formData.category_id]);

  useEffect(() => {
    async function loadAnos() {
      if (!formData.marca || !formData.modelo) return setAnos([]);
      try {
        const data = await fetchAnos(formData.category_id, formData.marca, formData.modelo);
        setAnos(data);
      } catch {
        console.error("Erro ao carregar anos");
      }
    }
    loadAnos();
  }, [formData.marca, formData.modelo, formData.category_id]);

  useEffect(() => {
    async function loadOptionals() {
      const { data, error } = await supabase.from("optionals").select("*");
      if (!error) setOptionals(data || []);
    }
    loadOptionals();
  }, []);

  async function handleFetchFipe() {
    if (!formData.marca || !formData.modelo || !formData.ano) return;
    try {
      const detalhes = await fetchDetalhesModelo(
        formData.category_id,
        formData.marca,
        formData.modelo,
        formData.ano
      );
      setFipeInfo({
        ...detalhes,
        codigoMarca: formData.marca,
        codigoModelo: formData.modelo,
        codigoAno: formData.ano,
      });
    } catch {
      console.error("Erro ao buscar detalhes FIPE");
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleToggleOptional(id: number) {
    setSelectedOptionals((prev) =>
      prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    setSelectedFiles(files);
  }

  function handleRemoveFile(idx: number) {
    setSelectedFiles((f) => f.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    try {
      await submitVehicleData(
        user,
        formData,
        fipeInfo,
        marcas,
        modelos,
        selectedFiles,
        selectedOptionals
      );
      router.push("/todosVeiculos");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="px-4 py-8 max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-medium text-gray-600">Escolha em qual lista adicionar</h1>
            <div className="relative inline-flex bg-gray-200 rounded-full p-1 h-10 w-64">
              <div
                className={`absolute top-1 left-1 w-1/2 h-8 bg-white rounded-full shadow transition-transform duration-300
                  ${formData.is_for_sale ? "translate-x-0" : "translate-x-full"}`}
              />

              <button
                type="button"
                onClick={() => setFormData((f) => ({ ...f, is_for_sale: true }))}
                className={`relative z-10 flex-1 text-sm font-medium transition-colors
                  ${formData.is_for_sale ? "text-blue-600" : "text-gray-600"}`}
              >
                Lista de Desejo
              </button>

              <button
                type="button"
                onClick={() => setFormData((f) => ({ ...f, is_for_sale: false }))}
                className={`relative z-10 flex-1 text-sm font-medium transition-colors
                  ${!formData.is_for_sale ? "text-blue-600" : "text-gray-600"}`}
              >
                Minha Garagem
              </button>
            </div>
          </div>
        {/* Formulário */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seletor FIPE */}
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
                  <span className="font-semibold">Valor FIPE:</span>{" "}
                  {fipeInfo.Valor}
                </p>
                <p>
                  <span className="font-semibold">Referência:</span>{" "}
                  {fipeInfo.MesReferencia}
                </p>
              </div>
            )}

            {/* Dados do veículo */}
            <VehicleDataForm
              preco={formData.preco}
              quilometragem={formData.quilometragem}
              cor={formData.cor}
              combustivel={formData.combustivel}
              observacoes={formData.observacoes}
              onChange={handleChange}
            />

            {/* Dados do vendedor */}
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

            {/* Upload de imagens */}
            <FileUpload
              previewUrls={previewUrls}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Salvando..." : "Adicionar Veículo"}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
