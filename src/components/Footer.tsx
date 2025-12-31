import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-14 font-medium">
      <div className="container mx-auto px-4">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* LOGO + TEXT */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/logo.webp"
                alt="God Will Empowerment Initiative Logo"
                height={70}
                width={70}
                className="rounded-full"
              />
              <h3 className="text-xl font-semibold tracking-wide">
                Gods Will MFB
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-300 pr-4">
              Trusted microfinance solutions for salary earners, small
              businesses, and growing families.  
              We help you access loans faster, easier, and with confidence.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#32CD32]">Quick Links</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="/" className="hover:text-[#32CD32] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#32CD32] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#32CD32] transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/loan" className="hover:text-[#32CD32] transition">
                  Loan Products
                </Link>
              </li>
            </ul>
          </div>

          {/* PRODUCTS */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#32CD32]">
              Loan Products
            </h4>
            <ul className="space-y-3 text-gray-300">
              <li>Salary Advance Loan</li>
              <li>Business Boost Loan</li>
              <li>SME Growth Loan</li>
              <li>Personal Micro Loan</li>
            </ul>
          </div>

          {/* CONTACT + SOCIALS */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#32CD32]">
              Contact Us
            </h4>

            <p className="text-gray-300 mb-2">0700-555-8899</p>
            <p className="text-gray-300 mb-2">support@godswillmfb.ng</p>
            <p className="text-gray-300">
              Zone 6, Julia Street, Wuse, Abuja
            </p>

            <div className="flex space-x-4 mt-5">
              <a className="hover:text-[#32CD32] transition">
                <Facebook size={20} />
              </a>
              <a className="hover:text-[#32CD32] transition">
                <Twitter size={20} />
              </a>
              <a className="hover:text-[#32CD32] transition">
                <Instagram size={20} />
              </a>
              <a className="hover:text-[#32CD32] transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Gods Will Microfinance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
