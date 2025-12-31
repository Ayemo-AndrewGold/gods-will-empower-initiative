import Image from "next/image";

import Header from "@/components/Header"
import Hero from "@/components/Hero";
import LoanOptions from "@/components/LoanOptions";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <Header />
      <Hero />
      <LoanOptions />
      <ContactForm />
      <Footer />
    </div>
  );
}
