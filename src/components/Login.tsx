"use client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";

export default function LoginPage() {
  return <Login />;
}

export function Login() {
  const [currentImage, setCurrentImage] = useState(0);

  const backgroundImages = [
    "/money.jpg",
    "/moneyloan4.png",
    "/moneyloan3.webp",
    "/moneyloan1.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <div className="w-full md:w-2/3 flex flex-col p-4 md:p-8">
        <Header />
        <div className="w-full h-px bg-gray-300 mb-6"></div>
        <main className="flex flex-col justify-center flex-grow max-w-md mx-auto w-full">
          <LoginTitle />
          <LoginForm />
        </main>
      </div>

      <div className="hidden md:block md:w-1/3 relative">
        {backgroundImages.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Background ${index + 1}`}
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-[2000ms] ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-10 text-white">
          <div className="max-w-md">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 typing-text">
              Admin Dashboard Login Page
            </h2>
            <p className="text-sm md:text-[1.1rem] leading-relaxed fade-in-text mt-2">
              Log in to continue protecting what matters most.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- HEADER -------------------- */

function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center w-full mb-2">
      <Logo />
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <Link href="/" className="text-black text-sm md:text-base font-bold">
          Back to home
        </Link>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center">
      <Image src="/logo.webp" alt="Company logo" height={100} width={100} />
    </div>
  );
}

/* -------------------- TITLE -------------------- */

function LoginTitle() {
  return (
    <div className="mb-8">
      <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
        Administrative login
      </h2>
      <p className="text-black text-sm md:text-base font-semibold">
        Welcome back! Please enter your details.
      </p>
    </div>
  );
}

/* -------------------- LOGIN FORM -------------------- */

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <form className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 relative">
        <input
          type="email"
          value={email}
          placeholder=" "
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className="peer w-full h-12 md:h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300"
        />
        <label className="absolute text-xs md:text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 md:top-4 left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0">
          Email
        </label>
      </div>

      <div className="mb-4 relative">
        <input
          type="password"
          value={password}
          placeholder=" "
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className="peer w-full h-12 md:h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300"
        />
        <label className="absolute text-xs md:text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 md:top-4 left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0">
          Password
        </label>
      </div>

      <SimpleButton 
        email={email} 
        password={password} 
        setError={setError}
      />

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
        <p className="text-xs text-gray-600">📧 Email: admin@godswill.org</p>
        <p className="text-xs text-gray-600">🔑 Password: Admin@123</p>
      </div>
    </form>
  );
}

/* -------------------- SIMPLE BUTTON WITH REAL API -------------------- */

function SimpleButton({
  email,
  password,
  setError,
}: {
  email: string;
  password: string;
  setError: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call real login API
      const response = await authService.login({ email, password });

      if (response.success) {
        // Success! Redirect based on role
        if (response.user.role === 'Admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      // Handle errors
      const errorMessage = error.response?.data?.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !email || !password}
      type="button"
      className={`w-full md:w-[200px] h-[50px] bg-[#028835] rounded-full text-white font-semibold flex items-center justify-center transition-all ${
        isLoading || !email || !password
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-green-700 hover:scale-105"
      }`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Signing in...
        </>
      ) : (
        <>
          Continue
          <span className="w-[30px] h-[30px] ml-3 flex items-center justify-center bg-white rounded-full">
            <MoveRight color="#000" size={20} />
          </span>
        </>
      )}
    </button>
  );
}