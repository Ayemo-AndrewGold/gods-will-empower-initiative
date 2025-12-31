'use client'
import React, { useState } from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';
import { CgMenuLeft, CgClose } from 'react-icons/cg';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

  return (
    <header className="bg-black shadow-sm fixed top-0 z-10 w-full left-0 transition-all duration-300">
      {/* Top bar */}
      {/* <div className="bg-gray-100 py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-gray-600">Abuja, Nigeria 110111</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-gray-600">Sunday-Friday 9am-8pm</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-green-600">
                <FaFacebookF size={16} />
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600">
                <FaLinkedinIn size={16} />
              </a>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-600 ">
              <Image
                src="/logo.webp"
                width={95}
                height={90}
                alt="Gods will Empowerment Logo"
                />                
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-green-600 font-bold">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-green-600 font-bold text-green-500">
                Company
              </Link>
              {/* <Link href="/faq" className="text-gray-600 hover:text-green-600">
                FAQ
              </Link> */}
              <Link href="/contact" className="text-gray-600 hover:text-green-600m font-bold">
                Contact
              </Link>
            </div>

           

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-green-600 focus:outline-none"
              >
                {isMenuOpen ? <CgClose size={24} /> : <CgMenuLeft size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                Home
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                About
              </Link>
              <Link href="/faq" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                FAQ
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-600 hover:text-green-600">
                Contact
              </Link>
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-semibold">(234) 555-0129</span>
              </div>
             
            </div>
          </div>
        )}

      </nav>
    </header>
  );
};

export default Header;
