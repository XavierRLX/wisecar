// src/lib/formatters.ts
export function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  
  export function formatMoney(value: number | null): string {
    if (value == null) return "—";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  