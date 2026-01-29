"use client";
import { MoveRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import { toast } from 'sonner';

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
  }, []);

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
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Admin Dashboard Login Page
            </h2>
            <p className="text-sm md:text-[1.1rem] leading-relaxed mt-2">
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
  const [showPassword, setShowPassword] = useState(false);

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
          className="peer w-full h-12 md:h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <label className="absolute text-xs md:text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 md:top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500">
          Email
        </label>
      </div>

      <div className="mb-4 relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder=" "
          className="peer w-full h-12 md:h-14 px-4 pt-5 pr-12 rounded-md bg-gray-100 border border-gray-300 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <label
          htmlFor="password"
          className="absolute text-xs md:text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 md:top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500"
        >
          Password
        </label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <SimpleButton 
        email={email} 
        password={password} 
        setError={setError}
      />
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

    // Early validation
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    setError("");
    
    // Show loading toast
    const loadingToast = toast.loading("Signing in...");

    try {
      // Call real login API using your authService
      const response = await authService.login({ email, password });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.success) {
        // Show success toast
        toast.success(response.message || "Login successful!");
        
        // Redirect based on role
        if (response.user.role === 'Admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Show error message
        const errorMessage = response.message || "Incorrect credentials. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Get user-friendly error message
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error.response?.data?.message) {
        const apiMessage = error.response.data.message;
        
        // Convert technical errors to user-friendly messages
        if (apiMessage.includes("buffering timed out") || apiMessage.includes("timeout")) {
          errorMessage = "Connection timeout. Please check your internet and try again.";
        } else if (apiMessage.includes("Network Error") || apiMessage.includes("ECONNREFUSED")) {
          errorMessage = "Cannot connect to server. Please try again later.";
        } else if (apiMessage.includes("Invalid credentials") || apiMessage.includes("incorrect")) {
          errorMessage = "Incorrect email or password. Please try again.";
        } else if (apiMessage.includes("User not found")) {
          errorMessage = "Account not found. Please check your email.";
        } else if (apiMessage.includes("Account is deactivated") || apiMessage.includes("inactive")) {
          errorMessage = "Your account has been deactivated. Contact administrator.";
        } else {
          // Use the API message if it's already user-friendly
          errorMessage = apiMessage;
        }
      } else if (error.message) {
        // Handle other error types
        if (error.message.includes("Network Error")) {
          errorMessage = "No internet connection. Please check your network.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timeout. Please try again.";
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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