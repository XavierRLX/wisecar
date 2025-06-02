// components/VehicleWizardForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  fetchMarcas,
  fetchModelos,
  fetchAnos,
  fetchDetalhesModelo,
} from "@/lib/fipe";
import { VehicleStatus } from "@/types";

import FipeSelectors from "@/components/FipeSelectors";
import VehicleDataForm from "@/components/VehicleDataForm";
import SellerForm from "@/components/SellerForm";
import OptionalsSelect from "@/components/OptionalsSelect";
import FileUpload from "@/components/FileUpload";

// <<-- CORREÇÃO AQUI: import nomeado, pois não há default export em ToggleFilter.tsx -->
import { ToggleFilter, Option as ToggleOption } from "@/components/ToggleFilter";

import { submitVehicleData } from "@/lib/vehicleService";

// Tipo para controlar os dados intermediários do “wizard”
interface WizardFormData {
  status: VehicleStatus | "";          // "WISHLIST" | "GARAGE" | "FOR_SALE"
  category_id: "carros" | "motos" | ""; // categoria FIPE
  marca: string;                        // código FIPE da marca
  modelo: string;                       // código FIPE do modelo
  ano: string;                          // código FIPE do ano
  fipeInfo: any | null;                 // objeto bruto retornado da FIPE
  preco: string;                        // string numérica (pode vir do FIPE ou ser digitado)
  quilometragem: string;
  cor: string;
  combustivel: string;
  observacoes: string;
  // Dados do vendedor (apenas para status = WISHLIST)
  sellerType: "particular" | "profissional" | "";
  sellerName: string;
  phone: string;
  company: string;
  socialMedia: string;
  address: string;
  // Opcionais + imagens
  selectedOptionals: number[];
  selectedFiles: File[];
}

const statusOptions: ToggleOption<VehicleStatus>[] = [
  { value: "WISHLIST", label: "Desejado" },
  { value: "GARAGE",    label: "Garagem" },
  { value: "FOR_SALE",  label: "Venda" },
];

export default function VehicleWizardForm() {
  const router = useRouter();

  // ========== 1) Estados internos do “wizard” ==========
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<WizardFormData>({
    status: "",
    category_id: "",
    marca: "",
    modelo: "",
    ano: "",
    fipeInfo: null,
    preco: "",
    quilometragem: "",
    cor: "",
    combustivel: "",
    observacoes: "",
    sellerType: "",
    sellerName: "",
    phone: "",
    company: "",
    socialMedia: "",
    address: "",
    selectedOptionals: [],
    selectedFiles: [],
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  // Listas de FIPE e opcionais
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);
  const [optionals, setOptionals] = useState<any[]>([]);

  // Para gerar previews das imagens
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // ========== 2) useEffect para carregar FIPE e opcionais ==========

  // 2.1) Carregar “optionals” da tabela
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

  // 2.2) Carregar “marcas” assim que categoria for escolhida
  useEffect(() => {
    if (!formData.category_id) {
      setMarcas([]);
      return;
    }
    fetchMarcas(formData.category_id)
      .then((list) => setMarcas(list))
      .catch((err) => console.error("Erro fetchMarcas:", err));
  }, [formData.category_id]);

  // 2.3) Carregar “modelos” assim que “marca” for preenchida
  useEffect(() => {
    if (!formData.marca) {
      setModelos([]);
      return;
    }
    fetchModelos(formData.category_id as "carros" | "motos", formData.marca)
      .then((res) => setModelos(res.modelos))
      .catch((err) => console.error("Erro fetchModelos:", err));
  }, [formData.marca, formData.category_id]);

  // 2.4) Carregar “anos” assim que “modelo” for preenchido
  useEffect(() => {
    if (!formData.modelo) {
      setAnos([]);
      return;
    }
    fetchAnos(
      formData.category_id as "carros" | "motos",
      formData.marca,
      formData.modelo
    )
      .then((list) => setAnos(list))
      .catch((err) => console.error("Erro fetchAnos:", err));
  }, [formData.modelo, formData.category_id, formData.marca]);

  // 2.5) Gerar “previewUrls” assim que “selectedFiles” mudar
  useEffect(() => {
    const urls = formData.selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls(urls);
    return () => {
      // Ao desmontar ou mudar arquivos, revogamos as URLs antigas
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.selectedFiles]);

  // ========== 3) Função para buscar detalhes FIPE ao clicar em “Buscar FIPE” ==========

  async function handleFetchFipe() {
    if (!formData.marca || !formData.modelo || !formData.ano) return;
    try {
      const detalhes = await fetchDetalhesModelo(
        formData.category_id as "carros" | "motos",
        formData.marca,
        formData.modelo,
        formData.ano
      );
      // Salvamos o objeto bruto + códigos, e já pré-preenchemos “preco”
      const fi = { ...detalhes,
        codigoMarca: formData.marca,
        codigoModelo: formData.modelo,
        codigoAno: formData.ano,
      };
      setFormData((prev) => ({ ...prev, fipeInfo: fi }));
      if (detalhes && detalhes.Valor) {
        // Converte string “50.000,00” → número 50000.00
        const valorNum = parseFloat(
          detalhes.Valor.replace(".", "").replace(",", ".")
        );
        setFormData((p) => ({ ...p, preco: valorNum.toString() }));
      }
    } catch (err) {
      console.error("Erro ao buscar FIPE:", err);
    }
  }

  // ========== 4) Handlers genéricos de formulário ==========

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleToggleOptional(id: number) {
    setFormData((prev) => {
      const jáSelecionado = prev.selectedOptionals.includes(id);
      const novos = jáSelecionado
        ? prev.selectedOptionals.filter((x) => x !== id)
        : [...prev.selectedOptionals, id];
      return { ...prev, selectedOptionals: novos };
    });
  }

  function handleFileChange(files: File[]) {
    setFormData((prev) => ({ ...prev, selectedFiles: files }));
  }

  function handleRemoveFile(idx: number) {
    setFormData((prev) => ({
      ...prev,
      selectedFiles: prev.selectedFiles.filter((_, i) => i !== idx),
    }));
  }

  // ========== 5) Função para enviar TODOS os dados ao Supabase ==========

  async function handleSubmitAll() {
    setLoadingSubmit(true);
    setErrorSubmit(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorSubmit("Usuário não autenticado");
      setLoadingSubmit(false);
      return;
    }

    try {
      await submitVehicleData(
        user,
        {
          category_id: formData.category_id,
          status: formData.status,
          marca: formData.marca,
          modelo: formData.modelo,
          ano: formData.ano,
          preco: formData.preco,
          quilometragem: formData.quilometragem,
          cor: formData.cor,
          combustivel: formData.combustivel,
          observacoes: formData.observacoes,
          vendedorTipo: formData.sellerType,
          nome_vendedor: formData.sellerName,
          telefone: formData.phone,
          empresa: formData.company,
          redes_sociais: formData.socialMedia,
          endereco: formData.address,
        },
        formData.fipeInfo,
        marcas,
        modelos,
        formData.selectedFiles,
        formData.selectedOptionals
      );
      // Redireciona para a lista de veículos cadastrados
      router.push("/veiculos/todosVeiculos");
    } catch (e: any) {
      setErrorSubmit(e.message || "Erro ao cadastrar veículo");
    } finally {
      setLoadingSubmit(false);
    }
  }

  // ========== 6) VALIDAÇÕES MÍNIMAS PARA LIBERAR CADA ETAPA ==========

// Step 1 → Step 2: basta ter status preenchido.
function canProceedToStep2() {
    return formData.status !== "";
  }
  
  // Step 2 → Step 3: exige marca, modelo e ano preenchidos.
  // Convertendo para string antes de chamar .trim()
  function canProceedToStep3() {
    return (
      String(formData.marca).trim() !== "" &&
      String(formData.modelo).trim() !== "" &&
      String(formData.ano).trim() !== ""
    );
  }
  
  // Step 3 → Step 4:
  // - se WISHLIST, exige dados de vendedor
  // - se GARAGE ou FOR_SALE, exige quilometragem e cor
  // - se FOR_SALE, exige também “preco”
  function canProceedToStep4() {
    if (formData.status === "WISHLIST") {
      return (
        formData.sellerType !== "" &&
        formData.sellerName.trim() !== "" &&
        formData.phone.trim() !== ""
      );
    } else {
      // GARAGE ou FOR_SALE
      if (
        formData.quilometragem.trim() === "" ||
        formData.cor.trim() === ""
      ) {
        return false;
      }
      // Se FOR_SALE, exige também “preco”
      if (formData.status === "FOR_SALE" && formData.preco.trim() === "") {
        return false;
      }
      return true;
    }
  }
  

  // ========== 7) Renderização de cada “step” ==========

  function renderStep() {
    switch (currentStep) {
      // ====== STEP 1: ESCOLHER O STATUS ======
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              1. Selecione o status do veículo
            </h2>
            <ToggleFilter<VehicleStatus>
              options={statusOptions}
              value={formData.status as VehicleStatus}
              onChange={(val) =>
                setFormData((prv) => ({ ...prv, status: val }))
              }
              className="w-full max-w-md"
            />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={!canProceedToStep2()}
                onClick={() => setCurrentStep(2)}
                className={`
                  px-4 py-2 rounded 
                  ${
                    canProceedToStep2()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                Próximo
              </button>
            </div>
          </div>
        );

      // ====== STEP 2: DADOS FIPE ======
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              2. Dados FIPE{" "}
              {formData.status === "WISHLIST" ? "(Obrigatório)" : "(Opcional)"}
            </h2>

            {/* Seleção de Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="block w-40 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="carros">Carros</option>
                <option value="motos">Motos</option>
              </select>
            </div>

            {/* Se categoria preenchida, mostrar FipeSelectors */}
            {formData.category_id && (
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
            )}

            {/* Se já houver fipeInfo, exibir resumo */}
            {formData.fipeInfo && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm">
                  <strong>FIPE encontrado:</strong>{" "}
                  {formData.fipeInfo.Modelo} – R$ {formData.fipeInfo.Valor}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!canProceedToStep3()}
                onClick={() => setCurrentStep(3)}
                className={`
                  px-4 py-2 rounded 
                  ${
                    canProceedToStep3()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                Próximo
              </button>
            </div>
          </div>
        );

      // ====== STEP 3: CAMPOS ESPECÍFICOS POR STATUS ======
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              3.{" "}
              {formData.status === "WISHLIST"
                ? "Detalhes do Vendedor"
                : "Dados do Veículo"}
            </h2>

            {formData.status === "WISHLIST" ? (
              /* Se “Desejado”, mostrar SellerForm */
              <SellerForm
                sellerType={formData.sellerType}
                sellerName={formData.sellerName}
                phone={formData.phone}
                company={formData.company}
                socialMedia={formData.socialMedia}
                address={formData.address}
                onChange={handleChange}
              />
            ) : (
              /* Se GARAGE ou FOR_SALE, mostrar VehicleDataForm */
              <div className="space-y-6">
                <VehicleDataForm
                  preco={formData.preco}
                  quilometragem={formData.quilometragem}
                  cor={formData.cor}
                  combustivel={formData.combustivel}
                  observacoes={formData.observacoes}
                  onChange={handleChange}
                />

                {/* Se status = FOR_SALE, exibir campo extra “Valor de Venda” */}
                {formData.status === "FOR_SALE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor de Venda (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="preco"
                      value={formData.preco}
                      onChange={handleChange}
                      className="block w-full max-w-xs rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 55000.00"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!canProceedToStep4()}
                onClick={() => setCurrentStep(4)}
                className={`
                  px-4 py-2 rounded 
                  ${
                    canProceedToStep4()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                Próximo
              </button>
            </div>
          </div>
        );

      // ====== STEP 4: OPCIONAIS + UPLOAD + RESUMO FINAL ======
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              4. Opcionais, Imagens e Revisão
            </h2>

            {/* Opcionais (checkboxes) */}
            <OptionalsSelect
              optionals={optionals}
              selectedOptionals={formData.selectedOptionals}
              onToggleOptional={handleToggleOptional}
            />

            {/* Upload de Imagens (preview + remoção) */}
            <FileUpload
              previewUrls={previewUrls}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />

            {/* Resumo Final (só‐leitura) */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-lg font-medium mb-2">Resumo do Cadastro</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Status:</strong>{" "}
                  {formData.status === "WISHLIST"
                    ? "Desejado"
                    : formData.status === "GARAGE"
                    ? "Na Garagem"
                    : "À Venda"}
                </li>
                <li>
                  <strong>Categoria:</strong>{" "}
                  {formData.category_id === "carros" ? "Carro" : "Moto"}
                </li>
                <li>
                  <strong>FIPE:</strong>{" "}
                  {formData.fipeInfo
                    ? `${formData.fipeInfo.Marca} ${formData.fipeInfo.Modelo} (${formData.fipeInfo.AnoModelo}) – R$ ${formData.fipeInfo.Valor}`
                    : "Não consultado"}
                </li>
                {formData.status !== "WISHLIST" && (
                  <>
                    <li>
                      <strong>Quilometragem:</strong> {formData.quilometragem} km
                    </li>
                    <li>
                      <strong>Cor:</strong> {formData.cor}
                    </li>
                    <li>
                      <strong>Combustível:</strong> {formData.combustivel}
                    </li>
                    {formData.status === "FOR_SALE" && (
                      <li>
                        <strong>Preço de Venda:</strong> R$ {formData.preco}
                      </li>
                    )}
                  </>
                )}
                {formData.status === "WISHLIST" && (
                  <>
                    <li>
                      <strong>Tipo Vendedor:</strong>{" "}
                      {formData.sellerType === "particular"
                        ? "Particular"
                        : "Profissional"}
                    </li>
                    <li>
                      <strong>Nome Vendedor:</strong> {formData.sellerName}
                    </li>
                    <li>
                      <strong>Telefone:</strong> {formData.phone}
                    </li>
                    {formData.company && (
                      <li>
                        <strong>Empresa:</strong> {formData.company}
                      </li>
                    )}
                    {formData.socialMedia && (
                      <li>
                        <strong>Redes Sociais:</strong> {formData.socialMedia}
                      </li>
                    )}
                    {formData.address && (
                      <li>
                        <strong>Endereço:</strong> {formData.address}
                      </li>
                    )}
                  </>
                )}
                {formData.selectedOptionals.length > 0 && (
                  <li>
                    <strong>Opcionais:</strong>{" "}
                    {optionals
                      .filter((o) => formData.selectedOptionals.includes(o.id))
                      .map((o) => o.name)
                      .join(", ")}
                  </li>
                )}
                {formData.selectedFiles.length > 0 && (
                  <li>
                    <strong>Fotos Selecionadas:</strong>{" "}
                    {formData.selectedFiles.length} arquivo(s)
                  </li>
                )}
              </ul>
            </div>

            {errorSubmit && (
              <p className="text-red-600 text-sm">{errorSubmit}</p>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={loadingSubmit}
                onClick={handleSubmitAll}
                className={`
                  px-4 py-2 rounded 
                  ${
                    !loadingSubmit
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                {loadingSubmit ? "Cadastrando..." : "Finalizar Cadastro"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // Container principal do wizard
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Indicador de progresso (4 bolinhas) */}
      <div className="flex justify-center mb-8 space-x-4">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-3 w-3 rounded-full ${
              currentStep === n ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Renderiza o step atual */}
      {renderStep()}
    </div>
  );
}
