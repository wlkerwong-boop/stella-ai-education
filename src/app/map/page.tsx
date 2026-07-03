"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MapRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/growth");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <p className="text-[#8a7a6a] text-sm">正在跳转至成长图谱...</p>
    </div>
  );
}
