// app/api/veiculos/[id]/customize/route.ts

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const prompt = formData.get("prompt");
    const imageFile = formData.get("image");
    const maskFile = formData.get("mask");

    if (!prompt || !imageFile || !maskFile) {
      return NextResponse.json(
        { error: "Campos obrigatórios: prompt, image e mask" },
        { status: 400 }
      );
    }

    // File recebido já é Blob PNG
    const imageUpload = imageFile as unknown as Blob;
    const maskUpload = maskFile as unknown as Blob;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const editResponse = await openai.images.edit({
      image: imageUpload,
      mask: maskUpload,
      prompt: prompt as string,
      n: 1,
      size: "256x256",
    });

    const editedUrl = editResponse.data?.[0]?.url;
    if (!editedUrl) {
      return NextResponse.json(
        { error: "Não foi possível gerar a imagem editada." },
        { status: 500 }
      );
    }

    return NextResponse.json({ editedUrl });
  } catch (err: any) {
    console.error("[API]/veiculos/[id]/customize erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
