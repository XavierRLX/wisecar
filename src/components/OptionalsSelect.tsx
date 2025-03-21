import React from "react";

interface OptionalsSelectProps {
  optionals: any[];
  selectedOptionals: number[];
  onToggleOptional: (id: number) => void;
}

export default function OptionalsSelect({ optionals, selectedOptionals, onToggleOptional }: OptionalsSelectProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">Opcionais</label>
      <div className="flex flex-wrap gap-4">
        {optionals.map((opcional) => (
          <label key={opcional.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={opcional.id}
              checked={selectedOptionals.includes(opcional.id)}
              onChange={() => onToggleOptional(opcional.id)}
            />
            <span className="text-sm">{opcional.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
