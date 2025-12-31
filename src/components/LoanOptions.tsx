import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

const LoanOptions = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div data-aos="zoom-in" data-aos-anchor-placement="top-center" className="w-full md:w-1/2 mb-8 md:mb-0">
            <Image
              src="/loan2.webp"
              alt="Happy family"
              width={500}
              height={300}
              className="rounded-lg mx-auto object-cover"
            />
          </div>
          <div data-aos="fade-left" data-aos-anchor-placement="top-center" data-aos-delay="200" className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-center mb-12">
              About Gods will Initiative
            </h2>
            <div className="border-2 p-4 rounded-lg">
              <div className="flex items-center mb-4 ">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <span className="text-lg">Fast Response Loan</span>
                <div className="flex-grow border-t border-gray-300 ml-4"></div>
                <span className="text-lg font-semibold">99%</span>
              </div>
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <span className="text-lg">Awesome Loan Disbursement</span>
                <div className="flex-grow border-t border-gray-300 ml-4"></div>
                <span className="text-lg font-semibold">99%</span>
              </div>
            </div>

            <p className="text-gray-600 mt-6">
            Gods Will Empowerment Initiative: Empowering Entrepreneurs, Transforming Businesses. Get the financial boost you need to take your business from zero to hero with our accessible loan programs and expert support.
            </p>
            <Link href="/">
              <button className="mt-6 bg-green-600 font-semibold  rounded-md p-2 text-white transition-colors">
                Read More
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between mt-10">
          <div data-aos="fade-right" data-aos-anchor-placement="top-center" data-aos-delay="300">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Our Loan Option
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg">
              Secure Your Future with Our Loan Solutions. Explore our comprehensive loan products, designed to fuel your growth, protect your investments, and keep you compliant – so you can focus on success, not surprises.
            </p>
            <Link href="/">
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors mb-12">
              Explore
            </button>
            </Link>
          </div>

          <div data-aos="fade-left" data-aos-anchor-placement="top-center" data-aos-delay="500" className="grid grid-cols-1  gap-8">
            <div className="bg-gray-100 p-6 rounded-md">
              <Image
                width={100}
                height={100}
                src="/loansec.jpg"
                alt="Loan buusiness growth Icon Icon"
                className="w-12 h-auto mb-4"
              />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Business Growth Loan
              </h3>
              <p className="text-gray-600 mb-2">
                  Fuel your business expansion with our flexible loan options.
              </p>
              <p className="text-gray-600">
                Get the funds you need to take your business to the next level, with repayment terms that work for you.
              </p>
            </div>
            <div  className="bg-gray-100 p-6 rounded-md">
              <Image
                width={100}
                height={100}
                src="/loansec.jpg"
                alt="Builders Liability Insurance Icon"
                className="w-12 h-auto mb-4"
              />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                 Personal Loan Solution 
              </h3>
              <p className="text-gray-600 mb-2">
                 Get the financial support you need, when you need it
              </p>
              <p className="text-gray-600">
                Our personal loans are designed to help you achieve your goals, with competitive rates and flexible repayment options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoanOptions;
