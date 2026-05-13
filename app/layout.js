import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import Providers from "@/component/Providers";

export const metadata = {
  title: "Apna Shoes – Premium Textile Store in Pakistan",
  description:
    "Shop premium Wash & Wear, Cotton & more at Timetex Fabrics. High-quality textiles with fast delivery in Pakistan.",
  keywords: [
    "Apna Shoes",
    "Timetex Fabrics",
    "Time Tex",
    "Fabrics in Pakistan",
    "Wash & Wear",
    "Cotton Fabric",
    "Men Fabrics Pakistan"
  ],
  metadataBase: new URL("https://timetex.pk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Apna Shoes – Premium Shoes Store in Pakistan",
    description:
      "High-quality Wash & Wear, Cotton, Boski & more. Shop premium fabrics with fast delivery.",
    url: "https://timetex.pk",
    siteName: "Timetex Fabrics",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apna Shoes",
    description: "Premium Wash & Wear, Cotton & more.",
    images: ["/logo.png"],
  },
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* All CLIENT logic moved here */}
        <Providers>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
