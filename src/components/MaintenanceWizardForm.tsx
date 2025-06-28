// components/MaintenanceWizardForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";
import type { MaintenanceValues, PartForm, DocForm } from "./MaintenanceWizardForm.types";

interface MaintenanceWizardFormProps {
  initial: MaintenanceValues;
  vehicles: { id: string; brand: string; model: string }[];
  selectedVehicle?: string;
  onVehicleChange?: (id: string) => void;
  onSubmit: (values: MaintenanceValues) => Promise<void>;
  onCancel?: () => void;
  submitting: boolean;
}

export default function MaintenanceWizardForm({
  initial,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  onSubmit,
  onCancel,
  submitting,
}: MaintenanceWizardFormProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [values, setValues] = useState<MaintenanceValues>(initial);
  const [parts, setParts] = useState<PartForm[]>(initial.parts);
  const [docs, setDocs] = useState<DocForm[]>(initial.docs);
  const [newPart, setNewPart] = useState<PartForm>({
    name: "",
    brand: "",
    purchase_place: "",
    quantity: "",
    price: "",
  });
  const [newDoc, setNewDoc] = useState<DocForm>({ title: "", file: null });
  const [error, setError] = useState<string | null>(null);

  // 1) Totais recalculados sempre que parts ou laborCost mudam
  const partsTotal = useMemo(
    () =>
      parts.reduce(
        (sum, p) =>
          sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
        0
      ),
    [parts]
  );
  const totalCost = useMemo(
    () => partsTotal + (Number(values.laborCost) || 0),
    [partsTotal, values.laborCost]
  );

  // Funções de adicionar/remover peças
  function handleAddPart() {
    if (!newPart.name.trim()) {
      setError("Informe o nome da peça");
      return;
    }
    const priceNum = Number(newPart.price);
    const qtyNum = Number(newPart.quantity);
    if (isNaN(priceNum) || isNaN(qtyNum) || qtyNum <= 0) {
      setError("Informe quantidade e preço válidos");
      return;
    }
    setError(null);
    setParts((arr) => [
      ...arr,
      { ...newPart, price: priceNum.toString(), quantity: qtyNum.toString() },
    ]);
    setNewPart({ name: "", brand: "", purchase_place: "", quantity: "", price: "" });
  }
  function handleRemovePart(index: number) {
    setParts((arr) => arr.filter((_, i) => i !== index));
  }

  // Funções de adicionar/remover documentos
  function handleAddDoc() {
    if (!newDoc.title.trim() || !newDoc.file) {
      setError("Informe título e selecione o arquivo");
      return;
    }
    setError(null);
    setDocs((arr) => [...arr, newDoc]);
    setNewDoc({ title: "", file: null });
  }
  function handleRemoveDoc(index: number) {
    setDocs((arr) => arr.filter((_, i) => i !== index));
  }

  // Submissão final
  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const finalVehicleId = selectedVehicle || values.vehicleId;
    if (!finalVehicleId) {
      setError("Selecione um veículo");
      return;
    }

    try {
      await onSubmit({
        ...values,
        vehicleId: finalVehicleId,
        parts,
        docs,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao salvar manutenção");
    }
  }

  // Validações de cada step
  function canProceedToStep2() {
    const vid = selectedVehicle || values.vehicleId || "";
    return vid.trim() !== "";
  }
  function canProceedToStep3() {
    return (
      values.maintenanceName.trim() !== "" &&
      values.status.trim() !== "" &&
      values.maintenanceType.trim() !== ""
    );
  }
  function canProceedToStep4() {
    if (values.status === "A fazer") {
      return values.scheduledDate.trim() !== "" && values.scheduledKm.trim() !== "";
    }
    if (values.status === "Feito") {
      return values.completedDate.trim() !== "" && values.completedKm.trim() !== "";
    }
    return true;
  }

  // ── 6) RENDERIZAÇÃO DINÂMICA DOS 4 STEPS ───────────────────────────────────────
  function renderStep() {
    switch (currentStep) {
      // ====== STEP 1: SELECIONE O VEÍCULO ======
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">1. Selecione o veículo</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veículo *
              </label>
              <select
                value={selectedVehicle || values.vehicleId}
                onChange={(e) => {
                  const vid = e.target.value;
                  if (onVehicleChange) onVehicleChange(vid);
                  setValues((v) => ({ ...v, vehicleId: vid }));
                }}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Selecione --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>

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

      // ====== STEP 2: MANUTENÇÃO OU MELHORIA (NOME, STATUS, TIPO) ======
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">2. Defina o tipo e os detalhes</h2>

            {/* 2.1) Categoria: Manutenção ou Melhoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="manutencao"
                    checked={values.category === "manutencao"}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        category: e.target.value as "manutencao" | "melhoria",
                      }))
                    }
                    className="mr-2"
                  />
                  Manutenção
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="melhoria"
                    checked={values.category === "melhoria"}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        category: e.target.value as "manutencao" | "melhoria",
                      }))
                    }
                    className="mr-2"
                  />
                  Melhoria
                </label>
              </div>
            </div>

            {/* 2.2) Nome da Manutenção/Melhoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título (Nome) *
              </label>
              <input
                required
                value={values.maintenanceName}
                onChange={(e) =>
                  setValues((v) => ({ ...v, maintenanceName: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  values.category === "melhoria"
                    ? "Ex: Trocar som / instalar faróis LED"
                    : "Ex: Troca de óleo / Revisão de freio"
                }
              />
            </div>

            {/* 2.3) Status da Tarefa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={values.status}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, status: e.target.value as any }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A fazer">A fazer</option>
                  <option value="Feito">Feito</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* 2.4) Tipo (apenas exemplos; ajuste conforme necessidade) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={values.maintenanceType}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, maintenanceType: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {values.category === "melhoria" ? (
                    <>
                      <option value="eletrica">Elétrica / Instalação</option>
                      <option value="acessorios">Acessórios</option>
                      <option value="estetica">Estética / Detalhamento</option>
                    </>
                  ) : (
                    <>
                      <option value="preventiva">Preventiva</option>
                      <option value="corretiva">Corretiva</option>
                      <option value="periodica">Periódica</option>
                    </>
                  )}
                </select>
              </div>
            </div>

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

      // ====== STEP 3: DATAS E KMs ======
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">3. Datas e Quilometragem</h2>

            {/* 3.1) Data Agendada e Km Agendado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Agendada *
                </label>
                <input
                  type="date"
                  value={values.scheduledDate}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, scheduledDate: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Km Agendado *
                </label>
                <input
                  type="number"
                  value={values.scheduledKm}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, scheduledKm: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 3.2) Caso “Feito”, exibe campos de conclusão */}
            {values.status === "Feito" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Conclusão *
                    </label>
                    <input
                      type="date"
                      value={values.completedDate}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, completedDate: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Km Concluído *
                    </label>
                    <input
                      type="number"
                      value={values.completedKm}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, completedKm: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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

      // ====== STEP 4: OFICINA, NOTAS, CUSTO, PEÇAS E DOCS ======
      case 4:
        return (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold">
              4. Oficina/Notas/Custo, Peças e Documentos
            </h2>

            {/* 4.1) Oficina / Profissional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oficina / Profissional
              </label>
              <input
                value={values.provider}
                onChange={(e) =>
                  setValues((v) => ({ ...v, provider: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: AutoCenter XYZ"
              />
            </div>

            {/* 4.2) Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={values.notes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, notes: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Trocar filtro de óleo e ver vazamento..."
              />
            </div>

            {/* 4.3) Custo de Mão de Obra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo Mão de Obra (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={values.laborCost}
                onChange={(e) =>
                  setValues((v) => ({ ...v, laborCost: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 150.00"
              />
            </div>

            {/* 4.4) ARRAY DE PEÇAS */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Peças</h3>
              {parts.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-600">
                      {p.brand && `${p.brand} • `}Qtd: {p.quantity} • R${" "}
                      {parseFloat(p.price).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePart(i)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-gray-50 p-3 rounded">
                <input
                  value={newPart.name}
                  onChange={(e) =>
                    setNewPart((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome da peça"
                  className="sm:col-span-2 rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={newPart.brand}
                  onChange={(e) =>
                    setNewPart((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  placeholder="Marca"
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={newPart.purchase_place}
                  onChange={(e) =>
                    setNewPart((prev) => ({
                      ...prev,
                      purchase_place: e.target.value,
                    }))
                  }
                  placeholder="Onde comprou"
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  min={1}
                  value={newPart.quantity}
                  onChange={(e) =>
                    setNewPart((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  placeholder="Qtd"
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={newPart.price}
                  onChange={(e) =>
                    setNewPart((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="Preço"
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPart}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
              >
                <PlusCircle className="w-5 h-5" /> Adicionar Peça
              </button>
            </div>

            {/* 4.5) ARRAY DE DOCUMENTOS */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Documentos (Ex.: Nota Fiscal)</h3>
              {docs.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1">{d.title}</span>
                  <a
                    href={URL.createObjectURL(d.file!)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(i)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Título do documento"
                  value={newDoc.title}
                  onChange={(e) =>
                    setNewDoc((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="file"
                  onChange={(e) =>
                    setNewDoc((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddDoc}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
              >
                <PlusCircle className="w-5 h-5" /> Adicionar Documento
              </button>
            </div>

            {/* 4.6) Exibe Totais de Peças e Custo Final */}
            <div className="text-right font-semibold text-gray-800">
              Peças: R$ {partsTotal.toFixed(2)} — Total Geral (c/ Mão de Obra): R${" "}
              {totalCost.toFixed(2)}
            </div>

            {/* Mensagem de erro geral */}
            {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Anterior
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-60"
              >
                {submitting ? "Salvando..." : "Finalizar"}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2 bg-red-400 text-white rounded hover:bg-red-500 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        );

      default:
        return null;
    }
  }

  // ── MARCA A ETAPA ATUAL NO TOPO (4 PONTINHOS) E EXIBE O CONTEÚDO ───────────────
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
