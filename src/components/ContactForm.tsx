import React from "react";
import { MapPin} from "lucide-react";

const ContactForm = () => {
  return (
    <section className="py-16">
      <div className="container  mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
        <div className="flex flex-wrap -mx-4">
          <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
            <div className="h-[300px] bg-gray-200 rounded-lg overflow-hidden relative">
              <iframe
                src="https://www.google.com/maps?q=Zone+6,+Julia+Street,+Wuse,+Lagos&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '12px', }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                
              ></iframe>
            </div>
          </div>

          <div  className="w-full flex flex-col justify-center md:w-1/2 px-4">
            <form data-aos="flip-right" data-aos-delay="500">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="Message"
                  // rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Send Mail
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
