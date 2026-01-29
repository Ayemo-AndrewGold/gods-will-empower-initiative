"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

const Hero: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"auth" | "contact" | null>(null);
  const [currentImage, setCurrentImage] = useState(0)

const backgroundImages = [
     "/money.jpg",
    "/moneyloan3.webp",
    "/moneyloan.webp",
    "/moneyloan4.png",
]

useEffect(() => {
  const interval = setInterval(()=> {
    setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
  },5000); 
  return () => clearInterval(interval);
}, [backgroundImages.length]);

  const openModal = (type: "auth" | "contact") => {
    setModalType(type);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  return (
    <div className="relative mt-15 h-[93vh]">
    
      {backgroundImages.map((src, index) => (
        <Image 
        key={index}
        src={src}
        alt={`Background ${index + 1}`}
        fill
        priority={index === 0}
        className={`object-cover transition-opacity duration-[2000ms] ${index === currentImage ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-black/65"></div>

      {/* Hero content */}
      <div className="absolute inset-0 flex items-center">
        <div data-aos="zoom-in" className="container mx-auto px-4">
    <h1 className="text-5xl font-bold text-white mb-4">
      Empower Your Future <br /> with Smart Microfinance
    </h1>
    <p className="text-xl text-white mb-8">
      Accessible microfinance solutions designed to help you grow. <br />
      Start today and take control of your financial journey.
    </p>

          <div className="flex space-x-4">
            <Link href="/login">
            <button
              className="bg-green-600 text-white px-6 py-3 font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
            >
              
              Login Now<span className="ml-2">→</span>
            </button>
             </Link>
            
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 modalOverlay"
        >
          <div
            className={`relative w-[480px] max-w-[92%] p-8 rounded-2xl shadow-xl modalCard
              ${modalType === "auth"
                ? "border border-white/30 bg-white/20 backdrop-blur-lg" // glassmorphism
                : "bg-white/80"} // solid white
            `}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition p-1 rounded"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .modalOverlay {
          animation: fadeIn 0.3s ease-in-out;
        }
        .modalCard {
          animation: slideDown 0.35s cubic-bezier(0.2, 0.9, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Hero;
