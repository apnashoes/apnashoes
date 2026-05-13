"use client";
import Head from "next/head";

export default function SEO({
  title = "Timetex Fabrics – Premium Textile Store in Pakistan",
  description = "Shop premium Wash & Wear, Cotton & more at Timetex Fabrics. High-quality textiles with fast delivery in Pakistan.",
  keywords = "Timetex, Timetex Fabrics, Time Tex, Fabrics in Pakistan, Wash & Wear",
  image = "/logo.png",
  url = "https://timetex.pk",
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <link rel="canonical" href={url} />

      {/* OG */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
