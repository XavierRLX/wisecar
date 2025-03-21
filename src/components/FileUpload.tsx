import React from "react";

interface FileUploadProps {
  previewUrls: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export default function FileUpload({ previewUrls, onFileChange, onRemoveFile }: FileUploadProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">Imagens do veículo (máx. 5)</label>
      <input type="file" name="image" multiple onChange={onFileChange} className="w-full p-2 border rounded" />
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img src={url} alt={`Pré-visualização ${index + 1}`} className="w-full h-32 object-cover rounded" />
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-700"
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
