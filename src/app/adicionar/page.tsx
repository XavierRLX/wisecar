"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Prepara os dados convertendo os campos numéricos
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

    const { error } = await supabase.from("vehicles").insert(vehicleData);
    if (error) {
      console.error("Erro ao adicionar veículo:", error.message);
      setLoading(false);
      return;
    }
    // Após adicionar, redireciona para a página de veículos
    router.push("/veiculos");
  }

  return (
    <AuthGuard>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Adicionar Veículo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>
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
