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

import FipeSelectors from "@/components/formsInpt/FipeSelectors";
import VehicleDataForm from "@/components/formsInpt/VehicleDataForm";
import SellerForm from "@/components/formsInpt/SellerForm";
import OptionalsSelect from "@/components/formsInpt/OptionalsSelect";
import FileUpload from "@/components/formsInpt/FileUpload";
import { ToggleFilter, Option as ToggleOption } from "@/components/ToggleFilter";

import { submitVehicleData } from "@/lib/vehicleService";

// 1) EXTENDENDO O ESTADO PARA “preco” E “salePrice”
interface WizardFormData {
  status: VehicleStatus | "";          // "WISHLIST" | "GARAGE" | "FOR_SALE"
  category_id: "carros" | "motos" | ""; // categoria FIPE
  marca: string;                        // código FIPE da marca
  modelo: string;                       // código FIPE do modelo
  ano: string;                          // código FIPE do ano
  fipeInfo: any | null;                 // objeto bruto retornado da FIPE

  // Aqui mantemos apenas um campo “preco”:
  // - Em GARAGE = “Preço comprado”
  // - Em WISHLIST→Sim = “Preço do veículo encontrado”
  // - NÃO usado em FOR_SALE (lá usamos salePrice para “Valor à venda”)
  preco: string;
  // Em FOR_SALE, “salePrice” será “Valor à venda”
  salePrice: string;

  quilometragem: string;
  cor: string;
  combustivel: string;
  observacoes: string;

  // Dados do vendedor
  sellerType: "particular" | "profissional" | "";
  sellerName: string;
  phone: string;
  company: string;
  socialMedia: string;
  address: string;

  // Apenas para WISHLIST: “Já encontrou algum carro?”
  foundCar: "yes" | "no" | "";

  // Opcionais + Imagens
  selectedOptionals: number[];
  selectedFiles: File[];
}

const statusOptions: ToggleOption<VehicleStatus>[] = [
  { value: "WISHLIST", label: "Desejo" },
  { value: "GARAGE",    label: "Garagem" },
  { value: "FOR_SALE",  label: "À Venda" },
];

export default function VehicleWizardForm() {
  const router = useRouter();

  // 2) ESTADO INICIAL DO WIZARD
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<WizardFormData>({
    status: "",
    category_id: "",
    marca: "",
    modelo: "",
    ano: "",
    fipeInfo: null,
    preco: "",
    salePrice: "",
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
    foundCar: "",
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

  // 3) USEEFFECTS PARA CARREGAR FIPE E OPCIONAIS

  // 3.1) Carrega “optionals” da tabela
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

  // 3.2) Carrega “marcas” assim que “category_id” mudar
  useEffect(() => {
    if (!formData.category_id) {
      setMarcas([]);
      return;
    }
    fetchMarcas(formData.category_id)
      .then((list) => setMarcas(list))
      .catch((err) => console.error("Erro fetchMarcas:", err));
  }, [formData.category_id]);

  // 3.3) Carrega “modelos” assim que “marca” mudar
  useEffect(() => {
    if (!formData.marca) {
      setModelos([]);
      return;
    }
    fetchModelos(formData.category_id as "carros" | "motos", formData.marca)
      .then((res) => setModelos(res.modelos))
      .catch((err) => console.error("Erro fetchModelos:", err));
  }, [formData.marca, formData.category_id]);

  // 3.4) Carrega “anos” assim que “modelo” mudar
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

  // 3.5) Gera “previewUrls” assim que “selectedFiles” mudar
  useEffect(() => {
    const urls = formData.selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.selectedFiles]);

  // 4) BUSCAR DETALHES FIPE
  async function handleFetchFipe() {
    if (!formData.marca || !formData.modelo || !formData.ano) return;
    try {
      const detalhes = await fetchDetalhesModelo(
        formData.category_id as "carros" | "motos",
        formData.marca,
        formData.modelo,
        formData.ano
      );
      const fi = {
        ...detalhes,
        codigoMarca: formData.marca,
        codigoModelo: formData.modelo,
        codigoAno: formData.ano,
      };
      setFormData((prev) => ({ ...prev, fipeInfo: fi }));

      if (detalhes && detalhes.Valor) {
        // Converte “50.000,00” → 50000.00
        const valorNum = parseFloat(
          detalhes.Valor.replace(".", "").replace(",", ".")
        );
        // Pré-preenche “preco” com valor FIPE
        setFormData((p) => ({ ...p, preco: valorNum.toString() }));
      }
    } catch (err) {
      console.error("Erro ao buscar FIPE:", err);
    }
  }

  // 5) HANDLERS DE FORMULÁRIO
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

  // 6) SUBMETER TODOS OS DADOS
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
      // O submitVehicleData atual só espera “preco” (que aqui será salePrice)
      await submitVehicleData(
        user,
        {
          category_id: formData.category_id,
          status: formData.status,
          marca: formData.marca,
          modelo: formData.modelo,
          ano: formData.ano,
          preco: formData.salePrice,      // envia “salePrice” para o back
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

      router.push("/veiculos/todosVeiculos");
    } catch (e: any) {
      setErrorSubmit(e.message || "Erro ao cadastrar veículo");
    } finally {
      setLoadingSubmit(false);
    }
  }

  // 7) VALIDAÇÕES PARA AVANÇAR CADA ETAPA
  function canProceedToStep2() {
    return formData.status !== "";
  }

  function canProceedToStep3() {
    return (
      String(formData.marca).trim() !== "" &&
      String(formData.modelo).trim() !== "" &&
      String(formData.ano).trim() !== ""
    );
  }

  function canProceedToStep4() {
    if (formData.status === "WISHLIST") {
      if (formData.foundCar === "") return false;
      if (formData.foundCar === "yes") {
        return (
          formData.sellerType !== "" &&
          formData.sellerName.trim() !== "" &&
          formData.phone.trim() !== "" &&
          formData.quilometragem.trim() !== "" &&
          formData.cor.trim() !== ""
        );
      }
      return formData.foundCar === "no";
    } else if (formData.status === "GARAGE") {
      // Em GARAGE, “preco” é “Preço comprado”
      return (
        formData.preco.trim() !== "" &&
        formData.quilometragem.trim() !== "" &&
        formData.cor.trim() !== ""
      );
    } else {
      // Em FOR_SALE, exige “preco” (comprado) e “salePrice” (à venda)
      return (
        formData.preco.trim() !== "" &&
        formData.salePrice.trim() !== "" &&
        formData.quilometragem.trim() !== "" &&
        formData.cor.trim() !== ""
      );
    }
  }

  // 8) RENDERIZAÇÃO DE CADA ETAPA
  function renderStep() {
    switch (currentStep) {
      // ====== STEP 1: “Qual lista adicionar seu veículo?” ======
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              Qual lista adicionar seu veículo?
            </h2>

            <ToggleFilter<VehicleStatus>
              options={statusOptions}
              value={formData.status as VehicleStatus}
              onChange={(val) =>
                setFormData((prv) => ({ ...prv, status: val }))
              }
              className="w-full max-w-md"
            />

            {formData.status && (
              <div className="flex items-start bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                {/* Ícone de exclamação */}
                <svg
                  className="h-6 w-6 text-blue-400 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.938-.894 1.938-2L21 7c0-1.106-.884-2-1.938-2H4.062C3.008 5 2.124 5.894 2.124 7l.006 12c0 1.106.884 2 1.938 2z"
                  />
                </svg>
                <div className="ml-3 text-blue-700 text-sm">
                  {formData.status === "WISHLIST" && (
                    <>
                      <strong>Desejo:</strong> Salve seu carro desejado e/ou os dados de um veículo que você viu em algum lugar.  
                      Estes carros ficarão visíveis apenas para usuários profissionais verificados, que poderão entrar em contato para oferecer modelos semelhantes.
                    </>
                  )}
                  {formData.status === "GARAGE" && (
                    <>
                      <strong>Garagem:</strong> Armazene seus veículos e gerencie manutenções e melhorias de modo fácil.  
                      Tenha sempre seu histórico de revisões e alertas para serviços pendentes.
                    </>
                  )}
                  {formData.status === "FOR_SALE" && (
                    <>
                      <strong>À Venda:</strong> Profissionais cadastrados poderão ver seu anúncio e entrar em contato para negociar a compra do seu carro.  
                      Preencha todos os detalhes para atrair ofertas de forma rápida.
                    </>
                  )}
                </div>
              </div>
            )}

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

            {/* Remove o select de categoria, porque o FipeSelectors já tem */}
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

      // ====== STEP 3: lógica condicional ======
      case 3:
        // SE “Desejo” (WISHLIST): pergunta “Já encontrou algum carro?”
        if (formData.status === "WISHLIST") {
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">3. Já encontrou algum carro?</h2>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="foundCar"
                    value="yes"
                    checked={formData.foundCar === "yes"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Sim
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="foundCar"
                    value="no"
                    checked={formData.foundCar === "no"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Não
                </label>
              </div>

              {formData.foundCar === "yes" && (
                <div className="space-y-6">
                  <SellerForm
                    sellerType={formData.sellerType}
                    sellerName={formData.sellerName}
                    phone={formData.phone}
                    company={formData.company}
                    socialMedia={formData.socialMedia}
                    address={formData.address}
                    onChange={handleChange}
                  />

                  <p className="text-xl font-semibold">Detalhes do veículo</p>
                  <VehicleDataForm
                    preco={formData.preco}
                    quilometragem={formData.quilometragem}
                    cor={formData.cor}
                    combustivel={formData.combustivel}
                    observacoes={formData.observacoes}
                    onChange={handleChange}
                    priceLabel="Preço do veículo encontrado"
                  />
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
        }

        // SE “Garagem” (GARAGE): exibe VehicleDataForm com “Preço comprado”
        if (formData.status === "GARAGE") {
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">3. Dados do veículo</h2>
              <VehicleDataForm
                preco={formData.preco}
                quilometragem={formData.quilometragem}
                cor={formData.cor}
                combustivel={formData.combustivel}
                observacoes={formData.observacoes}
                onChange={handleChange}
                priceLabel="Preço comprado"
              />

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
        }

        // SE “À Venda” (FOR_SALE): exibe dois campos separados
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">3. Dados do veículo</h2>
            <div className="space-y-6">
              {/* “Valor à venda” no campo salePrice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor à venda (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  className="block w-full max-w-xs rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 45000.00"
                />
              </div>

              {/* Restante dos campos do veículo */}
              <VehicleDataForm
                preco={"Preço comprado"}
                quilometragem={formData.quilometragem}
                cor={formData.cor}
                combustivel={formData.combustivel}
                observacoes={formData.observacoes}
                onChange={handleChange}
              />
            </div>

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
        // Se WISHLIST + foundCar="no", muda título e label
        const isWishNoCar =
          formData.status === "WISHLIST" && formData.foundCar === "no";

        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {isWishNoCar
                ? "4. Opcionais desejados"
                : "4. Opcionais, Imagens e Revisão"}
            </h2>

            <OptionalsSelect
              optionals={optionals}
              selectedOptionals={formData.selectedOptionals}
              onToggleOptional={handleToggleOptional}
            />

            <FileUpload
              previewUrls={previewUrls}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
              label={
                isWishNoCar
                  ? "Fotos do veículo desejado (máx. 5)"
                  : undefined
              }
            />

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-lg font-medium mb-2">Resumo do Cadastro</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Lista:</strong>{" "}
                  {formData.status === "WISHLIST"
                    ? "Desejo"
                    : formData.status === "GARAGE"
                    ? "Garagem"
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

                {/* Se WISHLIST + foundCar="yes" */}
                {formData.status === "WISHLIST" && formData.foundCar === "yes" && (
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
                    <li>
                      <strong>Quilometragem:</strong> {formData.quilometragem} km
                    </li>
                    <li>
                      <strong>Cor:</strong> {formData.cor}
                    </li>
                    <li>
                      <strong>Combustível:</strong> {formData.combustivel}
                    </li>
                    {formData.preco && (
                      <li>
                        <strong>Preço do veículo encontrado:</strong> R$ {formData.preco}
                      </li>
                    )}
                  </>
                )}

                {/* Se GARAGE */}
                {formData.status === "GARAGE" && (
                  <>
                    <li>
                      <strong>Preço comprado:</strong> R$ {formData.preco}
                    </li>
                    <li>
                      <strong>Quilometragem:</strong> {formData.quilometragem} km
                    </li>
                    <li>
                      <strong>Cor:</strong> {formData.cor}
                    </li>
                    <li>
                      <strong>Combustível:</strong> {formData.combustivel}
                    </li>
                  </>
                )}

                {/* Se FOR_SALE */}
                {formData.status === "FOR_SALE" && (
                  <>
                    <li>
                      <strong>Preço comprado:</strong> R$ {formData.preco}
                    </li>
                    <li>
                      <strong>Preço à venda:</strong> R$ {formData.salePrice}
                    </li>
                    <li>
                      <strong>Quilometragem:</strong> {formData.quilometragem} km
                    </li>
                    <li>
                      <strong>Cor:</strong> {formData.cor}
                    </li>
                    <li>
                      <strong>Combustível:</strong> {formData.combustivel}
                    </li>
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
                onClick={() => {
                  if (
                    formData.status === "WISHLIST" &&
                    formData.foundCar === "no"
                  ) {
                    setCurrentStep(2);
                  } else {
                    setCurrentStep(3);
                  }
                }}
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
