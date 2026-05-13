"use client";

import Image from "next/image";
import React from "react";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Navigation } from "swiper/modules";
import { ProductSlider } from "@/component/ProductSlider";
import Category from "@/component/Category";
import Footer from "@/component/Footer";
import VideoSection from "@/component/VideoSection";
import SEO from "@/component/SEO";
import Features from "@/component/Features";
import BestSellers from "@/component/bestseller";

const page = () => {
  return (
    <>
      <SEO
        title="Timetex Fabrics – Premium Quality Fabrics in Pakistan"
        description="Timetex Fabrics offers Wash & Wear, Cotton, and luxury textiles with fast nationwide delivery."
        url="https://timetex.pk"
      />

      {/* <!-- Main content area for demonstration --> */}
      <main className="w-full">
        <div className="relative w-full overflow-hidden aspect-[16/10] lg:aspect-[21/9.2] xl:aspect-[21/9.1]">
          {/* Background Image */}
          <Image
            src="/bg3.png"
            alt="Hero"
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="px-6 md:px-36 max-w-3xl text-white">
              <h2 className="text-sm md:text-5xl font-bold tracking-widest mb-2">
                STEP INTO
              </h2>

              <h1 className="text-4xl md:text-9xl font-bold tracking-widest text-[#C19850] mb-4">
                STYLE
              </h1>

              <p className="text-sm md:text-xl mb-1">Premium Quality Shoes</p>
              <p className="text-sm md:text-xl mb-6">
                Cash on Delivery Available
              </p>

              <div className="flex gap-4">
                <button className="bg-[#C19850] text-white px-6 py-2 rounded-md font-medium">
                  SHOP NOW
                </button>

                <button className="border border-[#C19850] text-[#C19850] px-6 py-2 rounded-md font-medium">
                  VIEW NEW ARRIVALS
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Features />

      <Category />

      <ProductSlider title="New Arrivals" />

      <BestSellers />

      {/* <VideoSection /> */}

      <Footer />
    </>
  );
};

export default page;
