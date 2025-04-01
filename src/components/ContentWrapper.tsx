"use client";
import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  return <div className={isLogin ? "" : "pt-12 pb-16"}>{children}</div>;
}
