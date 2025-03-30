import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import ClientOnly from "@/components/ClientOnly";
import ClientNav from "@/components/ClientNav";
import Header from "@/components/Header"; // importe o Header
import Providers from "./providers"; // Providers

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "WiseCar",
  description: "Seu projeto Next.js com ShadCN e Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900`}
      >
        <Providers>
          <Header />
          <div className="pt-12 pb-16">
            {children}
          </div>
          <ClientOnly>
            <ClientNav />
          </ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
