"use client";

import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";

// ssr: false para que se cargue solo en el navegador, donde existe el localStorage
const UserMenu = dynamic(() => import("./UserMenu"), { ssr: false });

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations("Header");

  return (
    <header className="flex justify-between items-center bg-white border-b border-slate-200 px-24 py-4">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3">

          <span className="text-2xl font-bold text-slate-900">{t("brand")}</span>
        </Link>

        <Link href="/plans" className="text-lg font-semibold text-blue-700">
          {t("explore")}
        </Link>
      </div>

      {/* key={pathname} hace que el menú se vuelva a cargar al cambiar de página,
          así se entera si el usuario acaba de iniciar sesión */}
      <div className="flex items-center gap-6">
        <Suspense fallback={null}>
          <LocaleSwitcher />
        </Suspense>
        <UserMenu key={pathname} />
      </div>
    </header>
  );
}
