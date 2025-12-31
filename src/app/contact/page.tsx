"use client";
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Example placeholder: integrate Formspree or Firebase later
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ fullName: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full h-[50vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-hero-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div data-aos="zoom-in" className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Contact Us</h1>
          <p className="max-w-2xl mx-auto text-lg">
            We're here to help with any questions about our property insurance services.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-6 md:px-16 bg-white flex-grow">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Form */}
          <div data-aos="fade-right" data-aos-delay="300">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Send Us a Message</h2>

            {isSubmitted ? (
              <div  className="p-6 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium">
                ✅ Thank you! Your message has been received. We’ll get back to you soon.
              </div>
            ) : (
              <form  onSubmit={handleSubmit} className="space-y-5">
                <div >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div data-aos="fade-left" data-aos-delay="300" className="bg-gray-50 rounded-2xl p-8 shadow-md">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Get In Touch</h3>
            <p className="text-gray-600 mb-6">
              You can reach us anytime through the following contact details:
            </p>

            <div className="space-y-5 text-gray-700">
              <div>
                <h4 className="font-semibold text-green-700">Address</h4>
                <p>Zone 6, Julia Street, Wuse, Abuja Nigeria</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700">Phone</h4>
                <p>+234 801 234 5678</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700">Email</h4>
                <p>info@fct-dcip.ng</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700">Office Hours</h4>
                <p>Mon - Fri: 8:00am – 5:00pm</p>
                <p>Sat: 9:00am – 1:00pm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (optional) */}
      <section data-aos="zoom-in" data-aos-delay="300" className="w-full h-[400px]">
        <iframe
          src="https://www.google.com/maps?q=Zone+6,+Julia+Street,+Wuse,+Abuja&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
