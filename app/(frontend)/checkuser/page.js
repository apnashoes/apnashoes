"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CheckUser() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const res = await fetch("/api/user/check", {
        method: "POST",
        body: JSON.stringify({ email: session?.user?.email }),
      });

      const data = await res.json();

      if (data.exists) {
        router.push("/");
      } else {
        router.push("/completeprofile");
      }
    };

    if (session) checkUser();
  }, [session]);

  return <p>Checking user...</p>;
}