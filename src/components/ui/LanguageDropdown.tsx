
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "zh", label: "中文(简体)", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
];
const DEFAULT_LANG = "en";

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    localStorage.getItem("lang") || DEFAULT_LANG
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set lang attribute for HTML root node and for RTL support
    document.documentElement.lang = selected;
    const langObj = LANGUAGES.find((l) => l.code === selected);
    if (langObj?.dir === "rtl") {
      document.body.dir = "rtl";
    } else {
      document.body.dir = "ltr";
    }
  }, [selected]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setSelected(code);
    localStorage.setItem("lang", code);
    setOpen(false);
    // Optional: If you want language-specific routes:
    // window.location.href = `/${code}${window.location.pathname}`;
  };

  const current = LANGUAGES.find((l) => l.code === selected) || LANGUAGES[0];

  return (
    <div className="relative inline-block z-50" ref={dropdownRef}>
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center px-2 py-1 text-sm text-black rounded-md bg-transparent hover:bg-gray-100 transition cursor-pointer select-none focus-visible:ring-1 focus:outline-none min-w-[60px]"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="font-medium">{current.label}</span>
        <ChevronDown className="ml-1 w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 max-h-56 rounded-xl shadow-lg bg-white ring-1 ring-black/10 overflow-y-auto transition animate-fade-in"
          style={{ minWidth: "112px" }}
          tabIndex={-1}
          role="listbox"
        >
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              tabIndex={0}
              className={`px-4 py-2 text-base cursor-pointer hover:bg-gray-100 ${
                lang.dir === "rtl" ? "text-right" : ""
              } ${selected === lang.code ? "font-semibold" : ""}`}
              dir={lang.dir}
              onClick={() => handleSelect(lang.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelect(lang.code);
              }}
              aria-selected={selected === lang.code}
              role="option"
            >
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
