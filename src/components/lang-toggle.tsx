"use client";

import { useTranslation } from "@/i18n/context";
import { Button } from "./ui/button";

export function LangToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-xs font-medium"
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
    >
      {locale === "en" ? "中文" : "EN"}
    </Button>
  );
}
