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
  // Dados do vendedor (apenas para status = WISHLIST e caso “Encontrou Carro = Sim”)
  sellerType: "particular" | "profissional" | "";
  sellerName: string;
  phone: string;
  company: string;
  socialMedia: string;
  address: string;
  // Nova flag: apenas para “Desejado” → pergunta se já encontrou carro
  foundCar: "yes" | "no" | "";
  // Opcionais + imagens
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
      const fi = {
        ...detalhes,
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

  // Step 1 → Step 2: basta ter “status” preenchido.
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

  // Step 3 → Step 4: lógica diferente se status = WISHLIST ou não.
  function canProceedToStep4() {
    if (formData.status === "WISHLIST") {
      // Para “Desejado”, precisa ter escolhido se encontrou carro (foundCar)
      if (formData.foundCar === "") return false;

      // Se “Encontrou Carro = Sim”, então exige também campos de vendedor e dados de veículo:
      if (formData.foundCar === "yes") {
        return (
          formData.sellerType !== "" &&
          formData.sellerName.trim() !== "" &&
          formData.phone.trim() !== "" &&
          formData.quilometragem.trim() !== "" &&
          formData.cor.trim() !== ""
        );
      }

      // Se “Encontrou Carro = Não”, basta avançar para etapa de upload
      return formData.foundCar === "no";
    } else {
      // Caso GARAGE ou FOR_SALE: exige quilometragem e cor
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
      // ====== STEP 1: “Qual lista adicionar seu veículo?” ======
      // Dentro de VehicleWizardForm.tsx, no case 1 (Step 1), faça esta alteração:

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
  
            {/** → Novo card de informação, exibido somente após escolher “status” */}
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

            {/* Seleção de Categoria */}
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

      // ====== STEP 3: lógica condicional para WISHLIST vs. GARAGE/FOR_SALE ======
      case 3:
        // SE “Desejado” (WISHLIST), primeiro pergunta “Já encontrou algum carro?”
        if (formData.status === "WISHLIST") {
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                3. Já encontrou algum carro?
              </h2>

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

              {/*
                Se o usuário escolheu “Sim” (foundCar === "yes"),
                então exibimos SellerForm + VehicleDataForm para preencher dados do vendedor e do carro.
              */}
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
                  <p className="text-xl font-semibold"> Detalhes do veículo </p>
                  <div className="space-y-6">
                    <VehicleDataForm
                      preco={formData.preco}
                      quilometragem={formData.quilometragem}
                      cor={formData.cor}
                      combustivel={formData.combustivel}
                      observacoes={formData.observacoes}
                      onChange={handleChange}
                    />
                  </div>
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

        // SE STATUS = GARAGE ou FOR_SALE, comporta-se como antes: apenas VehicleDataForm
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">3. Dados do Veículo</h2>

            <VehicleDataForm
              preco={formData.preco}
              quilometragem={formData.quilometragem}
              cor={formData.cor}
              combustivel={formData.combustivel}
              observacoes={formData.observacoes}
              onChange={handleChange}
            />

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
            <h2 className="text-xl font-semibold">4. Opcionais, Imagens e Revisão</h2>

            <OptionalsSelect
              optionals={optionals}
              selectedOptionals={formData.selectedOptionals}
              onToggleOptional={handleToggleOptional}
            />

            <FileUpload
              previewUrls={previewUrls}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
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

                {/*
                  Se for “Desejo” e “Encontrou Carro = Sim”:
                  exibimos também dados de vendedor e do veículo (quilometragem, cor, etc.)
                */}
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
                    {/*
                      Em “Desejo” não tem campo “Preço de Venda”,
                      mas se o usuário já encontrou o carro e quer
                      informar preço, esse valor ficou em formData.preco
                    */}
                    {formData.preco && (
                      <li>
                        <strong>Preço:</strong> R$ {formData.preco}
                      </li>
                    )}
                  </>
                )}

                {/*
                  Se for “Garagem” ou “À Venda”, mostramos sempre quilometragem, cor, etc.
                  E, se “À Venda”, mostramos também “Preço de Venda”.
                */}
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
                  // Se “Desejo” e usuário escolheu “Não encontrou carro”,
                  // voltamos diretamente ao passo 2. Senão, voltamos ao passo 3.
                  if (formData.status === "WISHLIST" && formData.foundCar === "no") {
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
