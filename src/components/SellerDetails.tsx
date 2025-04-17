// components/SellerDetails.tsx
"use client";

import { SellerDetails as SellerDetailsType } from "@/types";
import { User, User2, Phone, Building, Share2, MapPin } from "lucide-react";

interface Props {
  seller: SellerDetailsType | null;
}

export default function SellerDetails({ seller }: Props) {
  if (!seller) return <section className="bg-white p-6 rounded-lg shadow-md"><p>Sem detalhes do vendedor.</p></section>;

  return (
<section className="mb-4">
<h2 className="text-2xl font-bold mb-4">Detalhes do Vendedor</h2>
  <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          <p className="text-gray-700">
            <strong>Tipo:</strong> {seller.seller_type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <User2 className="w-5 h-5 text-gray-500" />
          <p className="text-gray-700">
            <strong>Nome:</strong> {seller.seller_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-500" />
          <p className="text-gray-700">
            <strong>Telefone:</strong> {seller.phone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-gray-500" />
          <p className="text-gray-700">
            <strong>Empresa:</strong> {seller.company}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-gray-500" />
          <p className="text-gray-700">
            <strong>Redes Sociais:</strong> {seller.social_media}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <p className="text-gray-700">
            <strong>Endereço:</strong> {seller.address}
          </p>
        </div>
      </div>
    </section>

  );
}
