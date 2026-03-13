"use client";

import { checkAuth } from "@/services/authServices";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifyPath = async () => {
      try {
        const authStatus = await checkAuth();

        if (authStatus.authenticated) {
          setIsAuthorized(true);
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.log("Auth check failed: ", error);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPath();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
}
