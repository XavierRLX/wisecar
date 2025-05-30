// components/ToggleFilter.tsx
"use client";
import React from "react";

export type Option<T extends string> = {
  value: T;
  label: string;
};

interface ToggleFilterProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  pillClassName?: string;
  buttonClassName?: string;
}

export function ToggleFilter<T extends string>({
  options,
  value,
  onChange,
  className = "",
  pillClassName = "absolute top-1 h-8 bg-white rounded-full shadow transition-all duration-300",
  buttonClassName = "relative z-10 flex-1 text-sm font-medium transition-colors",
}: ToggleFilterProps<T>) {
  const idx = options.findIndex((o) => o.value === value);
  const step = 100 / options.length;

  return (
    <div className={`relative inline-flex bg-gray-200 rounded-full p-1 h-10 ${className}`}>
      <div
        className={pillClassName}
        style={{
          left: `calc(${idx} * ${step}% + 1px)`,
          width: `calc(${step}% - 2px)`,
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"          
          onClick={() => onChange(opt.value)}
          className={`${buttonClassName} ${
            value === opt.value
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
