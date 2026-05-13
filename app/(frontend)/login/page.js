"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      alert("Invalid email or password"); // ✅ custom message
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-[755px] flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login to your account
        </h2>

        {/* Email Input */}
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg"
        />

        {/* Password Input */}
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg"
        />

        {/* Login Button */}
        <button onClick={handleLogin} className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800">
          Login
        </button>

        {/* Divider */}
        <div className="text-center my-4 text-gray-500">OR</div>

        {/* Google Login */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/checkuser" })}
          className="w-full border p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Register Link */}
        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}