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
import { VehicleStatus } from "@/types";

interface VehicleFormData {
  category_id: "carros" | "motos";
  status: VehicleStatus;
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

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<VehicleFormData>({
    category_id: "carros",
    status: "WISHLIST",
    marca: "",
    modelo: "",
    ano: "",
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
    fetchMarcas(formData.category_id).then(setMarcas).catch(console.error);
  }, [formData.category_id]);

  useEffect(() => {
    if (!formData.marca) return setModelos([]);
    fetchModelos(formData.category_id, formData.marca)
      .then((d) => setModelos(d.modelos))
      .catch(console.error);
  }, [formData.marca, formData.category_id]);

  useEffect(() => {
    if (!formData.modelo) return setAnos([]);
    fetchAnos(formData.category_id, formData.marca, formData.modelo)
      .then(setAnos)
      .catch(console.error);
  }, [formData.modelo, formData.category_id, formData.marca]);

  useEffect(() => {
    supabase
      .from("optionals")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar opcionais:", error);
        } else {
          setOptionals(data || []);
        }
      });
  }, []);
  

  async function handleFetchFipe() {
    if (!formData.marca || !formData.modelo || !formData.ano) return;
    const detalhes = await fetchDetalhesModelo(
      formData.category_id,
      formData.marca,
      formData.modelo,
      formData.ano
    );
    setFipeInfo({ ...detalhes, codigoMarca: formData.marca, codigoModelo: formData.modelo, codigoAno: formData.ano });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  }

  function handleToggleOptional(id: number) {
    setSelectedOptionals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setSelectedFiles(Array.from(e.target.files).slice(0, 5));
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
      router.push("/veiculos/todosVeiculos");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="px-4 py-8 max-w-4xl mx-auto space-y-8">
        {/* Toggle de Status */}
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-medium text-gray-600">Status do Veículo</h1>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option value="WISHLIST">Lista de Desejo</option>
            <option value="GARAGE">Minha Garagem</option>
            <option value="FOR_SALE">À Venda</option>
          </select>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
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
                <p><span className="font-semibold">Valor FIPE:</span> {fipeInfo.Valor}</p>
                <p><span className="font-semibold">Referência:</span> {fipeInfo.MesReferencia}</p>
              </div>
            )}

            <VehicleDataForm
              preco={formData.preco}
              quilometragem={formData.quilometragem}
              cor={formData.cor}
              combustivel={formData.combustivel}
              observacoes={formData.observacoes}
              onChange={handleChange}
            />

            <SellerForm
              sellerType={formData.vendedorTipo}
              sellerName={formData.nome_vendedor}
              phone={formData.telefone}
              company={formData.empresa}
              socialMedia={formData.redes_sociais}
              address={formData.endereco}
              onChange={handleChange}
            />

            <OptionalsSelect
              optionals={optionals}
              selectedOptionals={selectedOptionals}
              onToggleOptional={handleToggleOptional}
            />

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
