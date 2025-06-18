// components/MaintenanceWizardForm.types.ts

// ==== TIPAGENS PARA CADA “parte” (peça) e “documento” ====
export interface PartForm {
    id?: string;
    name: string;
    brand: string;
    purchase_place: string;
    quantity: string;
    price: string;
  }
  
  export interface DocForm {
    title: string;
    file: File | null;
  }
  
  // === TUDO O QUE SERÁ ENVIADO NO FINAL ===
  export interface MaintenanceValues {
    vehicleId?: string;           // selecionado no Step 1
    category: "manutencao" | "melhoria";
    maintenanceName: string;       // Nome / Título
    status: "A fazer" | "Feito" | "Cancelado";
    maintenanceType: string;       // preventivo, corretivo, etc. ou melhoria específica
    scheduledDate: string;         // “YYYY-MM-DD”
    scheduledKm: string;           // texto que será convertido em número
    completedDate: string;
    completedKm: string;
    provider: string;
    notes: string;
    laborCost: string;             // texto → número
    parts: PartForm[];
    docs: DocForm[];
  }
  