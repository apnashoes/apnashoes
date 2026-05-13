"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CompleteProfile() {
  const { data: session } = useSession();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/user/create", {
      method: "POST",
      body: JSON.stringify({
        name: session?.user?.name,
        email: session?.user?.email,
        image: session?.user?.image,
        phone,
        address,
      }),
    });

    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow w-96">
        <h2 className="text-xl font-bold mb-4">Complete Profile</h2>

        <input
          value={session?.user?.name || ""}
          disabled
          className="w-full mb-2 p-2 border rounded"
        />

        <input
          value={session?.user?.email || ""}
          disabled
          className="w-full mb-2 p-2 border rounded"
        />

        <input
          placeholder="Phone"
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />

        <input
          placeholder="Address"
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white p-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}