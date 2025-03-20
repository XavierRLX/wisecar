export async function fetchMarcas(categoria: "carros" | "motos") {
    const response = await fetch(`https://parallelum.com.br/fipe/api/v1/${categoria}/marcas`);
    if (!response.ok) throw new Error("Erro ao buscar marcas");
    return await response.json();
  }
  
  export async function fetchModelos(categoria: "carros" | "motos", marcaId: string) {
    const response = await fetch(`https://parallelum.com.br/fipe/api/v1/${categoria}/marcas/${marcaId}/modelos`);
    if (!response.ok) throw new Error("Erro ao buscar modelos");
    return await response.json();
  }
  
  export async function fetchDetalhesModelo(
    categoria: "carros" | "motos",
    marcaId: string,
    modeloId: string,
    ano: string
  ) {
    const url = `https://parallelum.com.br/fipe/api/v1/${categoria}/marcas/${marcaId}/modelos/${modeloId}/anos/${ano}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao buscar detalhes do modelo");
    }
    return await response.json();
  }
  
export async function fetchAnos(
    categoria: "carros" | "motos",
    marcaId: string,
    modeloId: string
  ) {
    const url = `https://parallelum.com.br/fipe/api/v1/${categoria}/marcas/${marcaId}/modelos/${modeloId}/anos`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao buscar anos");
    }
    return await response.json();
  }
  
  export async function fetchFipeAtualizado(
    categoria: "carros" | "motos",
    marcaCodigo: string,
    modeloCodigo: string,
    anoCodigo: string
  ) {
    const url = `https://parallelum.com.br/fipe/api/v1/${categoria}/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos/${anoCodigo}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao buscar dados FIPE atualizados");
    }
    return await response.json();
  }
  
  