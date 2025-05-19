"use client";
import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFull = pathname === "/login" || pathname.startsWith("/chat/");
  return (
    <div
      className={`
        w-full
        ${isFull ? "h-screen-svh" : "pt-12 pb-16"}
      `}
    >
      {children}
    </div>
  );
}
