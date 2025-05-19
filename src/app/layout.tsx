// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import ClientOnly from "@/components/ClientOnly";
import GlobalNav from "@/components/GlobalNav";
import Providers from "./providers";
import ContentWrapper from "@/components/ContentWrapper";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "WiseCar",
  description: "Seu projeto Next.js com ShadCN e Supabase",
};

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
      </head>
      <body
        className={`overflow-x-hidden antialiased bg-gray-100 text-gray-900 ${geistSans.variable} ${geistMono.variable}`}
      >
        <Providers>
          <ClientOnly>
            <GlobalNav />
          </ClientOnly>
          <main className="w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

