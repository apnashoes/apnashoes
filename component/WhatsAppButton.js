// components/WhatsAppChat.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(true); // for floating bubble
  const [typedText, setTypedText] = useState("");
  const message = "Hi 👋\nHow may I help you?";

  const pathname = usePathname();

  // Typing effect inside popup
  useEffect(() => {
    if (open) {
      setTypedText("");
      let i = 0;
      const interval = setInterval(() => {
        if (i < message.length) {
          setTypedText((prev) => prev + message.charAt(i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [open]);

   // ❌ Hide button on checkout & order-confirmation pages
  if (pathname.startsWith("/checkout") || pathname.startsWith("/order-confirmation")) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="mb-2 w-72 sm:w-80 bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-green-500 text-white px-4 py-2">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Support"
                  width={40}
                  className="rounded-full border border-white h-10"
                />
                <div>
                  <p className="text-sm font-semibold">Apna Shoes</p>
                  <p className="text-xs text-green-100">Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Message */}
            <div className="p-4 text-gray-700 text-sm whitespace-pre-line min-h-[60px]">
              {typedText || (
                <span className="animate-pulse text-gray-400">Typing...</span>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 text-right">
              <a
                href="https://chat.whatsapp.com/LBMP6Vdla3D3sHN0A9H6nn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-600 transition-all"
              >
                <FaWhatsapp size={18} /> Start Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating hint bubble */}
      {showHint && !open && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-md border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          How may I help you?
        </motion.div>
      )}

      {/* WhatsApp button */}
      <button
        onClick={() => {
          if (!open) {
            setShowHint(true); // hide bubble only when opening
          }
          setOpen(!open);
        }}
        className="flex items-center justify-center bg-green-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-green-600 transition-all"
      >
        <FaWhatsapp size={26} />
      </button>
    </div>
  );
}
