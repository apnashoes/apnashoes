// components/CookieConsent.js
"use client";
import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState("en"); // default English

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookie_consent");
    if (!storedConsent) {
      setVisible(true);
    }
    const storedLang = localStorage.getItem("lang");
    if (storedLang) setLang(storedLang);
  }, []);

  const handleConsent = (choice) => {
    localStorage.setItem("cookie_consent", choice);
    setVisible(false);
  };

  const toggleLang = () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  if (!visible) return null;

  const text = {
    en: {
      message:
        "We value your privacy. We use cookies and other technologies to personalize your experience, perform marketing, and collect analytics. Learn more in our",
      policy: "Privacy Policy",
      accept: "Accept",
      decline: "Decline",
      switch: "اردو",
    },
    ur: {
      message:
        "ہم آپ کی رازداری کی قدر کرتے ہیں۔ ہم آپ کے تجربے کو ذاتی بنانے، مارکیٹنگ کرنے اور تجزیات جمع کرنے کے لیے کوکیز اور دیگر ٹیکنالوجیز استعمال کرتے ہیں۔ مزید جانیں ہماری",
      policy: "پرائیویسی پالیسی",
      accept: "قبول کریں",
      decline: "مسترد کریں",
      switch: "English",
    },
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[600px] 
      bg-white shadow-xl rounded-lg p-4 z-50 animate-[fadeInUp_0.5s_ease-out]"
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      <p className="text-gray-700 text-sm mb-3">
        {text[lang].message}{" "}
        <a href="/privacy-policy" className="text-blue-600 underline">
          {text[lang].policy}
        </a>
        .
      </p>
      <div className="flex justify-between items-center">
        <button
          onClick={toggleLang}
          className="text-xs underline text-gray-500"
        >
          {text[lang].switch}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleConsent("decline")}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          >
            {text[lang].decline}
          </button>
          <button
            onClick={() => handleConsent("accept")}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            {text[lang].accept}
          </button>
        </div>
      </div>
    </div>
  );
}
