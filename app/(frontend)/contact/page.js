"use client";

import { useState } from "react";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-16">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="text-gray-600 mt-2">
          We'd love to hear from you. Get in touch with us!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Send Message</h2>

          {submitted && (
            <p className="text-green-600 mb-4">
              Message sent successfully!
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />

            <input
              type="email"
              placeholder="Your Email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />

            <textarea
              placeholder="Your Message"
              rows={5}
              required
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow flex items-start gap-4">
            <FiMapPin size={24} />
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-gray-600">
                Karachi, Pakistan
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-start gap-4">
            <FiPhone size={24} />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-gray-600">+92 300 1234567</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-start gap-4">
            <FiMail size={24} />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-gray-600">support@apnashoes.com</p>
            </div>
          </div>

          {/* Google Map */}
          <div className="rounded-2xl overflow-hidden shadow">
            <iframe
              src="https://maps.google.com/maps?q=karachi&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="250"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}