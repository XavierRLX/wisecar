// components/SellerDetails.tsx
"use client";

import { SellerDetails as SellerDetailsType } from "@/types";

interface Props {
  seller: SellerDetailsType | null;
}

export default function SellerDetails({ seller }: Props) {
  if (!seller) return <section className="bg-white p-6 rounded-lg shadow-md"><p>Sem detalhes do vendedor.</p></section>;

  return (
    <section className="bg-white p-6 rounded-lg shadow-md space-y-2">
      <h2 className="text-2xl font-bold">Detalhes do Vendedor</h2>
      <p><strong>Tipo:</strong> {seller.seller_type}</p>
      <p><strong>Nome:</strong> {seller.seller_name}</p>
      <p><strong>Telefone:</strong> {seller.phone}</p>
      <p><strong>Empresa:</strong> {seller.company}</p>
      <p><strong>Redes Sociais:</strong> {seller.social_media}</p>
      <p><strong>Endereço:</strong> {seller.address}</p>
    </section>
  );
}
