// app/consulta-fipe/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import LoadingState from "@/components/LoadingState";
import FipeSelectors from "@/components/formsInpt/FipeSelectors";
import { 
  fetchMarcas, 
  fetchModelos, 
  fetchAnos, 
  fetchDetalhesModelo 
} from "@/lib/fipe";

export default function ConsultaFipePage() {
  const router = useRouter();

  // estados de seleção
  const [category, setCategory] = useState<"carros" | "motos">("carros");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");

  // listas de opções
  const [marcas, setMarcas] = useState<{ codigo: string; nome: string }[]>([]);
  const [modelos, setModelos] = useState<{ codigo: string; nome: string }[]>([]);
  const [anos, setAnos] = useState<{ codigo: string; nome: string }[]>([]);

  // resultado FIPE
  const [fipeInfo, setFipeInfo] = useState<any>(null);
  const [loadingFipe, setLoadingFipe] = useState(false);

  // Carrega marcas ao mudar categoria
  useEffect(() => {
    setMarca("");
    setModelo("");
    setAno("");
    setMarcas([]);
    fetchMarcas(category)
      .then((data) => setMarcas(data))
      .catch((err) => console.error("Erro ao carregar marcas:", err));
  }, [category]);

  // Carrega modelos ao mudar marca
  useEffect(() => {
    setModelo("");
    setAno("");
    setModelos([]);
    if (!marca) return;
    fetchModelos(category, marca)
      .then((res) => setModelos(res.modelos))
      .catch((err) => console.error("Erro ao carregar modelos:", err));
  }, [marca, category]);

  // Carrega anos ao mudar modelo
  useEffect(() => {
    setAno("");
    setAnos([]);
    if (!marca || !modelo) return;
    fetchAnos(category, marca, modelo)
      .then((res) => setAnos(res))
      .catch((err) => console.error("Erro ao carregar anos:", err));
  }, [marca, modelo, category]);

  // Handler de mudança genérico para FipeSelectors
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    switch (name) {
      case "category_id":
        setCategory(value as "carros" | "motos");
        break;
      case "marca":
        setMarca(value);
        break;
      case "modelo":
        setModelo(value);
        break;
      case "ano":
        setAno(value);
        break;
    }
    // limpa resultado anterior
    setFipeInfo(null);
  }

  // Busca os detalhes FIPE
  async function handleFetchFipe() {
    setLoadingFipe(true);
    try {
      const detalhes = await fetchDetalhesModelo(
        category,
        marca,
        modelo,
        ano
      );
      setFipeInfo(detalhes);
    } catch (err) {
      console.error("Erro ao buscar detalhes FIPE:", err);
      alert("Não foi possível buscar dados FIPE.");
    } finally {
      setLoadingFipe(false);
    }
  }

  return (
    <AuthGuard>
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Consulta FIPE</h1>
        </div>
        <p className="text-gray-600">
          Preencha os dados abaixo para consultar a Tabela FIPE.
        </p>

        {/* Seletor FIPE */}
        <div className="bg-white shadow rounded-lg p-6">
          <FipeSelectors
            category={category}
            marca={marca}
            modelo={modelo}
            ano={ano}
            marcas={marcas}
            modelos={modelos}
            anos={anos}
            onChange={handleChange}
            onFetchFipe={handleFetchFipe}
          />
        </div>

        {/* Loading ou Resultado */}
        {loadingFipe ? (
          <LoadingState message="Buscando dados FIPE..." />
        ) : fipeInfo ? (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Detalhes FIPE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <div>
                <strong>Marca:</strong> {fipeInfo.Marca}
              </div>
              <div>
                <strong>Modelo:</strong> {fipeInfo.Modelo}
              </div>
              <div>
                <strong>Ano Modelo:</strong> {fipeInfo.AnoModelo}
              </div>
              <div>
                <strong>Combustível:</strong> {fipeInfo.Combustivel}
              </div>
              <div>
                <strong>Código FIPE:</strong> {fipeInfo.CodigoFipe}
              </div>
              <div>
                <strong>Referência:</strong> {fipeInfo.MesReferencia}
              </div>
              <div className="col-span-full">
                <strong>Valor:</strong>{" "}
                <span className="text-green-600 font-medium">
                  {fipeInfo.Valor}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AuthGuard>
  );
}
