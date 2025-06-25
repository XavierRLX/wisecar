import React from "react";

interface OptionalsSelectProps {
  optionals: any[];
  selectedOptionals: number[];
  onToggleOptional: (id: number) => void;
}
export default function OptionalsSelect({
  optionals,
  selectedOptionals,
  onToggleOptional,
}: OptionalsSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Opcionais
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {optionals.map((opcional) => (
          <label key={opcional.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              value={opcional.id}
              checked={selectedOptionals.includes(opcional.id)}
              onChange={() => onToggleOptional(opcional.id)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{opcional.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
