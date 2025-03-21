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

interface VehicleFormData {
  category_id: "carros" | "motos";
  marca: string;         // FIPE brand code
  modelo: string;        // FIPE model code
  ano: string;           // FIPE year code (ex: "2014-3")
  fipe_info?: string;    // FIPE details JSON
  price: string;
  mileage: string;
  color: string;
  fuel: string;
  notes: string;
  seller_type: "individual" | "professional";
  seller_name: string;
  phone: string;
  company: string;
  social_media: string;
  address: string;
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
    seller_type: "individual",
    seller_name: "",
    phone: "",
    company: "",
    social_media: "",
    address: "",
  });
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);
  const [fipeInfo, setFipeInfo] = useState<any>(null);
  const [optionals, setOptionals] = useState<any[]>([]);
  const [selectedOptionals, setSelectedOptionals] = useState<number[]>([]);

  // Update preview URLs for file uploads
  useEffect(() => {
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  // Load FIPE brands based on category
  useEffect(() => {
    async function loadMarcas() {
      try {
        const data = await fetchMarcas(formData.category_id);
        setMarcas(data);
      } catch (error) {
        console.error("Error loading brands", error);
      }
    }
    loadMarcas();
  }, [formData.category_id]);

  // Load FIPE models based on selected brand
  useEffect(() => {
    async function loadModelos() {
      if (formData.marca) {
        try {
          const data = await fetchModelos(formData.category_id, formData.marca);
          setModelos(data.modelos);
        } catch (error) {
          console.error("Error loading models", error);
        }
      } else {
        setModelos([]);
      }
    }
    loadModelos();
  }, [formData.marca, formData.category_id]);

  // Load FIPE years based on selected brand and model
  useEffect(() => {
    async function loadAnos() {
      if (formData.marca && formData.modelo) {
        try {
          const data = await fetchAnos(formData.category_id, formData.marca, formData.modelo);
          setAnos(data); // data is an array with available years
        } catch (error) {
          console.error("Error loading years", error);
        }
      } else {
        setAnos([]);
      }
    }
    loadAnos();
  }, [formData.marca, formData.modelo, formData.category_id]);

  // Load optionals from the database
  useEffect(() => {
    async function loadOptionals() {
      const { data, error } = await supabase.from("optionals").select("*");
      if (error) {
        console.error("Error loading optionals:", error.message);
      } else {
        setOptionals(data || []);
      }
    }
    loadOptionals();
  }, []);

  // Fetch FIPE details for the selected year
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
        console.error("Error fetching FIPE details", error);
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
        alert("You can select up to 5 images.");
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

    // Get logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Prepare vehicle data (without seller details, as these go to seller_details)
    const vehicleData = {
      user_id: user.id,
      category_id: formData.category_id === "carros" ? 1 : 2,
      fipe_info: fipeInfo ? JSON.stringify(fipeInfo) : null,
      brand: formData.marca,  // You could map this code to a name if desired
      model: formData.modelo,
      year: formData.ano ? parseInt(formData.ano.split("-")[0]) : null,
      price: parseFloat(formData.price),
      mileage: parseInt(formData.mileage),
      color: formData.color,
      fuel: formData.fuel,
      notes: formData.notes,
    };

    // Insert vehicle record
    const { data, error } = await supabase
      .from("vehicles")
      .insert(vehicleData)
      .select();
    if (error) {
      console.error("Error adding vehicle:", error.message);
      setLoading(false);
      return;
    }
    const insertedVehicle = data[0];

    // Upload images if any
    if (selectedFiles.length > 0) {
      await Promise.all(
        selectedFiles.map(async file => {
          const publicUrl = await uploadVehicleImage(insertedVehicle.id, file);
          if (!publicUrl) {
            console.error("Error uploading image for", file.name);
          }
        })
      );
    }

    // Insert seller details into seller_details table
    const sellerData = {
      vehicle_id: insertedVehicle.id,
      seller_type: formData.seller_type, // Ensure your form field name is updated accordingly
      seller_name: formData.seller_name,
      phone: formData.phone,
      company: formData.company,
      social_media: formData.social_media,
      address: formData.address,
    };
    const { error: sellerError } = await supabase
      .from("seller_details")
      .insert(sellerData);
    if (sellerError) {
      console.error("Error inserting seller details:", sellerError.message);
    }

    // Insert selected optionals into the vehicle_optionals relation table
    if (selectedOptionals.length > 0) {
      const rows = selectedOptionals.map(optionalId => ({
        vehicle_id: insertedVehicle.id,
        optional_id: optionalId,
      }));
      const { error: optError } = await supabase
        .from("vehicle_optionals")
        .insert(rows);
      if (optError) {
        console.error("Error inserting optionals:", optError.message);
      }
    }

    setLoading(false);
    router.push("/veiculos");
  }

  return (
    <AuthGuard>
      <div className="p-8 max-w-4xl mx-auto bg-white shadow rounded">
        <h1 className="text-3xl font-bold mb-6 text-center">Add Vehicle</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="carros">Car</option>
              <option value="motos">Motorcycle</option>
            </select>
          </div>
          {/* FIPE Brand Selector */}
          <div>
            <label className="block mb-1 font-medium">Brand (FIPE)</label>
            <select
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select brand</option>
              {marcas.map((marca) => (
                <option key={marca.codigo} value={marca.codigo}>
                  {marca.nome}
                </option>
              ))}
            </select>
          </div>
          {/* FIPE Model Selector */}
          <div>
            <label className="block mb-1 font-medium">Model (FIPE)</label>
            <select
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select model</option>
              {modelos.map((modelo: any) => (
                <option key={modelo.codigo} value={modelo.codigo}>
                  {modelo.nome}
                </option>
              ))}
            </select>
          </div>
          {/* FIPE Year Selector */}
          <div>
            <label className="block mb-1 font-medium">Year (FIPE)</label>
            <select
              name="ano"
              value={formData.ano}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select year</option>
              {anos.map((item: any) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>
          {/* Button to fetch FIPE details */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFetchFipe}
              className="text-sm text-blue-500 underline"
            >
              Fetch FIPE details
            </button>
          </div>
          {fipeInfo && (
            <div className="p-4 bg-gray-100 rounded">
              <p>
                <strong>FIPE Value:</strong> {fipeInfo.Valor}
              </p>
              <p>
                <strong>Reference Date:</strong> {fipeInfo.MesReferencia}
              </p>
            </div>
          )}
          {/* Additional vehicle data fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium">Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., 50000.00"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Mileage</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., 30000"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., Silver"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Fuel</label>
              <input
                type="text"
                name="fuel"
                value={formData.fuel}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., Gasoline"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Additional info..."
            />
          </div>
          {/* Seller Contact Information */}
          <div>
            <label className="block mb-1 font-medium">Seller Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="seller_type"
                  value="individual"
                  checked={formData.seller_type === "individual"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Individual
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="seller_type"
                  value="professional"
                  checked={formData.seller_type === "professional"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Professional
              </label>
            </div>
          </div>
          {formData.seller_type === "individual" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="seller_name"
                  value={formData.seller_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., (11) 99999-8888"
                />
              </div>
            </div>
          )}
          {formData.seller_type === "professional" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., AutoCenter"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Seller</label>
                <input
                  type="text"
                  name="seller_name"
                  value={formData.seller_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., (11) 99999-8888"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Social Media</label>
                <input
                  type="text"
                  name="social_media"
                  value={formData.social_media}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., @autocenter"
                />
              </div>
              <div className="col-span-2">
                <label className="block mb-1 font-medium">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., 123 Main St, City, Country"
                />
              </div>
            </div>
          )}
          {/* Optionals Section */}
          <div>
            <label className="block mb-1 font-medium">Optionals</label>
            <div className="flex flex-wrap gap-4">
              {optionals.map((opcional: any) => (
                <label key={opcional.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={opcional.id}
                    checked={selectedOptionals.includes(opcional.id)}
                    onChange={() => handleToggleOptional(opcional.id)}
                  />
                  <span className="text-sm">{opcional.nome}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block mb-1 font-medium">
              Vehicle Images (max. 5)
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
                    aria-label="Remove image"
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
            {loading ? "Saving..." : "Add Vehicle"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
