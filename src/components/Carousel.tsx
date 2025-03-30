"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  images: { image_url: string }[];
}

export default function Carousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative">
      {/* Imagem atual */}
      <div className="w-full h-96 relative">
        <Image
          src={images[currentIndex].image_url}
          alt={`Imagem ${currentIndex + 1}`}
          fill
          className="object-cover rounded-lg shadow-lg"
        />
      </div>
      {/* Setas */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      {/* Indicadores (bolinhas) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-blue-600" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
