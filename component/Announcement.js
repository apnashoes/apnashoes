"use client";
import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { AiFillTikTok } from "react-icons/ai";

const Announcement = () => {
  return (
    <div className="relative w-full overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-400/10 blur-xl opacity-40"></div>

      {/* Main Bar */}
      <div className="relative bg-black/80 backdrop-blur border-b border-white/10 text-white text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">

          {/* LEFT – Social Icons */}
          <div className="hidden md:flex items-center gap-3">
            {[ 
              { icon: Facebook, link: "https://www.facebook.com" },
              { icon: Youtube, link: "https://www.youtube.com" },
              { icon: Instagram, link: "https://www.instagram.com" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={i} href={item.link} target="_blank">
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 transition duration-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}

            {/* TikTok */}
            <Link href="https://www.tiktok.com" target="_blank">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 transition duration-300">
                <AiFillTikTok className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* CENTER – Animated Text */}
          <div className="flex-1 text-center font-medium tracking-wide">
            <p className="animate-pulse">
              🚀 Welcome To Apna Shoes | Cash on Delivery Available
            </p>
          </div>

          {/* RIGHT */}
          <div className="hidden md:flex items-center gap-4 text-gray-400">
            <Link href="#" className="hover:text-white transition">
              Pakistan
            </Link>
            <span className="w-[1px] h-4 bg-white/20"></span>
            <Link href="/trackorder" className="hover:text-white transition">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcement;