// components/ContentWrapper.tsx
"use client";
import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = pathname === "/login" || pathname.startsWith("/chat/");
  return <div className={isFullScreen ? "" : "pt-12 pb-16"}>{children}</div>;
}
