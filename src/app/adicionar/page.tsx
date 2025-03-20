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
  fetchDetalhesModelo 
} from "@/lib/fipe";

interface VehicleFormData {
  // Usamos os códigos FIPE para marca, modelo e ano
  category_id: "carros" | "motos";
  marca: string;    // Código da marca
  modelo: string;   // Código do modelo
  ano: string;      // Código do ano (ex: "2014-3")
  fipe_info?: string; // Dados FIPE completos (JSON)
  // Demais campos do veículo
  price: string;
  mileage: string;
  color: string;
  fuel: string;
  notes: string;
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
    price: "",
    mileage: "",
    color: "",
    fuel: "",
    notes: "",
  });
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);
  const [fipeInfo, setFipeInfo] = useState<any>(null);

  // Atualiza pré-visualizações sempre que os arquivos selecionados mudam
  useEffect(() => {
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  // Carrega as marcas da API FIPE com base na categoria selecionada
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

  // Carrega os modelos da API FIPE com base na marca selecionada
  useEffect(() => {
    async function loadModelos() {
      if (formData.marca) {
        try {
          const data = await fetchModelos(formData.category_id, formData.marca);
          // A API FIPE retorna um objeto com uma propriedade "modelos"
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

  // Carrega os anos disponíveis da API FIPE com base na marca e modelo selecionados
  useEffect(() => {
    async function loadAnos() {
      if (formData.marca && formData.modelo) {
        try {
          const data = await fetchAnos(formData.category_id, formData.marca, formData.modelo);
          setAnos(data); // data deve ser um array com os anos disponíveis
        } catch (error) {
          console.error("Erro ao carregar anos", error);
        }
      } else {
        setAnos([]);
      }
    }
    loadAnos();
  }, [formData.marca, formData.modelo, formData.category_id]);
  
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
        // Atualize os campos usando as chaves corretas: "marca" e "modelo"
        setFormData(prev => ({
          ...prev,
          marca: detalhes.Marca || prev.marca,
          modelo: detalhes.Modelo || prev.modelo,
        }));
      } catch (error) {
        console.error("Erro ao buscar detalhes FIPE", error);
      }
    }
  }
  
  
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Obtém o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Prepara os dados do veículo
    const vehicleData = {
      user_id: user.id,
      category_id: formData.category_id === "carros" ? 1 : 2,
      fipe_info: fipeInfo ? JSON.stringify(fipeInfo) : null,
      brand: formData.marca, 
      model: formData.modelo,
      year: formData.ano ? parseInt(formData.ano.split("-")[0]) : null,
      price: parseFloat(formData.price),
      mileage: parseInt(formData.mileage),
      color: formData.color,
      fuel: formData.fuel,
      notes: formData.notes,
    };

    // Insere o veículo na tabela "vehicles"
    const { data, error } = await supabase
      .from("vehicles")
      .insert(vehicleData)
      .select();
    if (error) {
      console.error("Erro ao adicionar veículo:", error.message);
      setLoading(false);
      return;
    }
    const insertedVehicle = data[0];

    // Faz o upload das imagens (se houver)
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

    setLoading(false);
    router.push("/veiculos");
  }

  return (
    <AuthGuard>
      <div className="p-8 max-w-3xl mx-auto bg-white shadow rounded">
        <h1 className="text-3xl font-bold mb-6 text-center">Adicionar Veículo</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seletor de Categoria */}
          <div>
            <label className="block mb-1 font-medium">Categoria</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="carros">Carro</option>
              <option value="motos">Moto</option>
            </select>
          </div>
          {/* Seletor de Marca (FIPE) */}
          <div>
            <label className="block mb-1 font-medium">Marca (FIPE)</label>
            <select
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione a marca</option>
              {marcas.map((marca) => (
                <option key={marca.codigo} value={marca.codigo}>
                  {marca.nome}
                </option>
              ))}
            </select>
          </div>
          {/* Seletor de Modelo (FIPE) */}
          <div>
            <label className="block mb-1 font-medium">Modelo (FIPE)</label>
            <select
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione o modelo</option>
              {modelos.map((modelo: any) => (
                <option key={modelo.codigo} value={modelo.codigo}>
                  {modelo.nome}
                </option>
              ))}
            </select>
          </div>
          {/* Seletor de Ano (FIPE) */}
          <div>
            <label className="block mb-1 font-medium">Ano (FIPE)</label>
            <select
              name="ano"
              value={formData.ano}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione o ano</option>
              {anos.map((item: any) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>
          {/* Botão para buscar detalhes FIPE */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFetchFipe}
              className="text-sm text-blue-500 underline"
            >
              Buscar valor FIPE
            </button>
          </div>
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
          {/* Demais campos manuais para os outros dados */}
          <div>
            <label className="block mb-1 font-medium">Preço</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: 50000.00"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Quilometragem</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: 30000"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Cor</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Prata"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Combustível</label>
            <input
              type="text"
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Gasolina"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Observações</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Informações adicionais..."
            />
          </div>
          {/* Campo para upload de imagens (máx. 5) */}
          <div>
            <label className="block mb-1 font-medium">
              Imagens do veículo (máx. 5)
            </label>
            <input
              type="file"
              name="image"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-700"
                    aria-label="Remover imagem"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "Salvando..." : "Adicionar Veículo"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
