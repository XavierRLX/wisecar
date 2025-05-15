// components/Carousel.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { useSwipeable } from "react-swipeable";

interface CarouselProps {
  images: { image_url: string }[];
}

export default function Carousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(
    images.map((_, i) => i === 0) // primeiro slide marcado como carregado
  );

  // Preload lado a lado: próxima e anterior
  useEffect(() => {
    const next = (currentIndex + 1) % images.length;
    const prev = (currentIndex - 1 + images.length) % images.length;
    [next, prev].forEach((idx) => {
      if (!loaded[idx]) {
        const img = new window.Image();
        img.src = images[idx].image_url;
        img.onload = () => {
          setLoaded((old) => {
            const copy = [...old];
            copy[idx] = true;
            return copy;
          });
        };
      }
    });
  }, [currentIndex, images, loaded]);

  // Callback quando o <Image> termina de carregar
  const onLoad = (idx: number) => {
    setLoaded((old) => {
      const copy = [...old];
      copy[idx] = true;
      return copy;
    });
  };

  const prevSlide = () =>
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextSlide = () =>
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  return (
    <div className="relative" {...handlers}>
      <div className="w-full h-56 relative bg-gray-100">
        {/* Spinner enquanto a imagem não carrega */}
        {!loaded[currentIndex] && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        )}

<Image
  unoptimized
  src={images[currentIndex].image_url}
  alt={`Slide ${currentIndex + 1}`}
  fill
  priority={currentIndex === 0}
  className={`object-cover rounded-t-lg transition-opacity duration-500 ${
    loaded[currentIndex] ? "opacity-100" : "opacity-0"
  }`}
  onLoadingComplete={() => onLoad(currentIndex)}
/>

      </div>

      {/* Navegação */}
      <button
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-100 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-100 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`w-2 h-2 rounded-full transition ${
              idx === currentIndex ? "bg-blue-600" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
