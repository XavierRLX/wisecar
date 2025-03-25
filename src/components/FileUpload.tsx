import React from "react";

interface FileUploadProps {
  previewUrls: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export default function FileUpload({ previewUrls, onFileChange, onRemoveFile }: FileUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Imagens do veículo (máx. 5)</label>
      <input
        type="file"
        name="image"
        multiple
        onChange={onFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-500"
      />
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Pré-visualização ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-700 text-xs"
                aria-label="Remover imagem"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
