// ATENÇÃO: apenas para desenvolvimento ou ambiente onde você controla totalmente o servidor.
// Isso faz com que o Node aceite certificados autoassinados.
// REMOVA esta linha em produção ou configure corretamente seu CA/TLS.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { Uploadable } from "openai";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1) Extrair formData do request
    const formData = await request.formData();
    const prompt    = formData.get("prompt") as string;
    const imageFile = formData.get("image")  as File;  // Blob recebido do cliente
    const maskFile  = formData.get("mask")   as File;  // Blob gerado pelo MaskEditor

    if (!prompt || !imageFile || !maskFile) {
      return NextResponse.json(
        { error: "Campos obrigatórios: prompt, image e mask" },
        { status: 400 }
      );
    }

    // 2) Ler a imagem (File → ArrayBuffer → Buffer)
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer      = Buffer.from(imageArrayBuffer);

    // 3) Ler a máscara (File → ArrayBuffer → Buffer)
    const maskArrayBuffer = await maskFile.arrayBuffer();
    const maskBuffer      = Buffer.from(maskArrayBuffer);

    // 4) Converter Buffer → Blob (o SDK do OpenAI aceita Blob como “arquivo”)
    //    Especificamos type: "image/png" porque estamos gerando PNG no cliente.
    const imageBlob = new Blob([imageBuffer], { type: "image/png" });
    const maskBlob  = new Blob([maskBuffer],  { type: "image/png" });

    // 5) Inicializar o cliente OpenAI (verifique se OPENAI_API_KEY está no .env.local)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    // 6) Chamar o endpoint de edição (DALL·E Edit) – sem chavinha extra
    const editResponse = await openai.images.edit({
      image:  imageBlob as unknown as Uploadable,
      mask:   maskBlob  as unknown as Uploadable,
      prompt: prompt,
      n:      1,
      size:  "256x256",
    });

    // 7) Extrair a URL da imagem editada
    const editedUrl = editResponse.data?.[0]?.url;
    if (!editedUrl) {
      return NextResponse.json(
        { error: "Não foi possível gerar a imagem editada." },
        { status: 500 }
      );
    }

    // 8) Retornar a URL gerada
    return NextResponse.json({ editedUrl });
  } catch (err: any) {
    console.error("[API]/veiculos/[id]/customize erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
