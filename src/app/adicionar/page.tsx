"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { uploadVehicleImage } from "@/hooks/useUploadImage";

interface VehicleFormData {
  category_id: string;
  brand: string;
  model: string;
  year: string;
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
    category_id: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    color: "",
    fuel: "",
    notes: "",
  });

  // Atualiza as URLs de preview sempre que os arquivos selecionados mudam
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Revoga as URLs para evitar vazamento de memória
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

    // Prepara os dados do veículo
    const vehicleData = {
      user_id: user.id,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
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

    // Se houver arquivos selecionados, faça o upload de cada um
    if (selectedFiles.length > 0) {
      await Promise.all(
        selectedFiles.map(async (file) => {
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
      <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded">
        <h1 className="text-2xl font-bold mb-6 text-center">Adicionar Veículo</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category_id" className="block mb-1 font-medium">
              Categoria
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione a categoria</option>
              <option value="1">Car</option>
              <option value="2">Motorcycle</option>
            </select>
          </div>
          <div>
            <label htmlFor="brand" className="block mb-1 font-medium">
              Marca
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Toyota"
            />
          </div>
          <div>
            <label htmlFor="model" className="block mb-1 font-medium">
              Modelo
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Corolla"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="year" className="block mb-1 font-medium">
                Ano
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Ex: 2020"
              />
            </div>
            <div>
              <label htmlFor="price" className="block mb-1 font-medium">
                Preço
              </label>
              <input
                type="number"
                step="0.01"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Ex: 50000.00"
              />
            </div>
            <div>
              <label htmlFor="mileage" className="block mb-1 font-medium">
                Quilometragem
              </label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Ex: 30000"
              />
            </div>
          </div>
          <div>
            <label htmlFor="color" className="block mb-1 font-medium">
              Cor
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Prata"
            />
          </div>
          <div>
            <label htmlFor="fuel" className="block mb-1 font-medium">
              Combustível
            </label>
            <input
              type="text"
              id="fuel"
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Gasolina"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block mb-1 font-medium">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Informações adicionais..."
            />
          </div>
          <div>
            <label htmlFor="image" className="block mb-1 font-medium">
              Imagens do veículo (máx. 5)
            </label>
            <input
              type="file"
              id="image"
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
                    className="absolute top-1 right-1 bg-black p-1 text-red-500 hover:bg-gray-200"
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
