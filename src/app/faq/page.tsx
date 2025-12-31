"use client";
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  // === Existing FCT-DCIP-focused FAQs ===
  {
    question: "What is the FCT-DCIP program about?",
    answer:
      "The Federal Capital Territory Development Control Insurance Program (FCT-DCIP) is a partnership initiative that promotes collaboration among homeowners, builders, surveyors, and the Development Control Department. The program ensures compliance with compulsory insurance laws and provides financial protection against risks such as building collapse, property damage, and construction-related liabilities.",
  },
  {
    question: "Who is required to participate in the FCT-DCIP program?",
    answer:
      "Participation is mandatory for property owners, builders, and contractors within the Federal Capital Territory. Under Sections 64 and 65 of the Insurance Act 2003, all public buildings and construction projects must be adequately insured to safeguard lives, property, and public safety.",
  },
  {
    question: "What types of insurance are covered under the FCT-DCIP?",
    answer:
      "The program includes key coverage types such as Builders’ Liability Insurance (for ongoing construction projects) and Occupiers’ Liability Insurance (for existing buildings). These policies protect against accidents, structural failure, and loss of life or property.",
  },
  {
    question: "How can I register or verify compliance under FCT-DCIP?",
    answer:
      "You can register through the official FCT-DCIP online portal or at designated registration centers in Abuja. Builders and property owners must provide valid documentation of their insurance coverage, which will be verified in partnership with recognized insurance providers.",
  },
  {
    question: "What happens if a builder or property owner fails to insure their building?",
    answer:
      "Non-compliance with Sections 64 and 65 of the Insurance Act 2003 attracts legal and regulatory consequences. Beyond penalties, failure to insure exposes property owners and builders to financial loss in the event of accidents or building collapse.",
  },
  {
    question: "How does the FCT-DCIP benefit homeowners and the public?",
    answer:
      "It provides peace of mind, promotes safer building practices, ensures accountability among professionals, and strengthens the protection of lives and investments in the FCT. It also supports the Development Control Department’s effort to enforce safety and compliance standards across Abuja.",
  },
  {
    question: "Who manages or oversees the FCT-DCIP program?",
    answer:
      "The program is supervised by the Abuja Metropolitan Management Council (AMMC) through the Department of Development Control, in collaboration with the Nigerian Insurers Association (NIA), accredited insurance companies, and technology partners.",
  },

  // === Your original FAQs ===
  {
    question: "What types of property insurance do you offer?",
    answer:
      "We provide comprehensive property insurance coverage for residential homes, commercial buildings, rental properties, and industrial assets. Our policies protect against fire, theft, flood, and other unforeseen damages.",
  },
  {
    question: "How do I get a property insurance quote?",
    answer:
      "You can request a free quote directly from our website by providing details about your property. One of our agents will contact you with a personalized plan that fits your needs and budget.",
  },
  {
    question: "Can I customize my insurance coverage?",
    answer:
      "Yes, we understand that every property is unique. Our team will work with you to customize your plan based on your specific requirements, whether you need basic or all-risk coverage.",
  },
  {
    question: "How do I file a claim after damage occurs?",
    answer:
      "To file a claim, log in to your account or contact our support team immediately. Provide your policy number, details of the incident, and any supporting documents. Our claims team will guide you through the process.",
  },
  {
    question: "How long does it take to process a claim?",
    answer:
      "Claim processing time depends on the nature of the damage and submitted documentation. However, most claims are reviewed and settled within 7–14 business days.",
  },
  {
    question: "Do you offer discounts for multiple properties?",
    answer:
      "Yes. We offer attractive multi-property and loyalty discounts for clients who insure more than one property with us.",
  },
  {
    question: "What is FCT-DCIP?",
    answer:
      "FCT-DCIP stands for Federal Capital Territory Development Control Insurance Program. It is a comprehensive insurance solution for property owners in Abuja.",
  },
  {
    question: "What are the benefits of the FCT-DCIP?",
    answer:
      "The FCT-DCIP provides protection against property damage, liability coverage, and ensures compliance with local regulations.",
  },
  {
    question: "Who are the stakeholders in the FCT-DCIP?",
    answer:
      "Stakeholders include property owners, developers, insurance providers, and the FCT Development Control Department.",
  },
  {
    question: "What is the advantage of the FCT-DCIP?",
    answer:
      "The FCT-DCIP offers tailored insurance solutions, streamlined processes, and enhanced protection for property investments in Abuja.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full h-[50vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-hero-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div data-aos="zoom-in" className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl mx-auto text-lg">
            Get clear answers about the FCT-DCIP program, compulsory building
            insurance, and property protection services.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 md:px-16 bg-white flex-grow">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-900">
            Your Questions, Answered
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <span className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-green-700 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#00800010] text-green-700 text-center py-16 px-6">
        <h2 className="text-3xl font-semibold mb-4">
          Still Have Questions?
        </h2>
        <p className="max-w-2xl mx-auto mb-6 text-lg">
          Our team is available to assist with inquiries about registration,
          insurance verification, or compliance under the FCT-DCIP program.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-green-700 font-medium px-8 py-3 rounded-full shadow hover:bg-gray-100 transition"
        >
          Contact Us
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
