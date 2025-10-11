"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Roboto } from "next/font/google";
import TextInput from "@/components/ui/TextInput";
import { useRouter } from "next/navigation";

const roboto = Roboto({ subsets: ["latin"], weight: ["300"] });

const MainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("❌ Please fill all fields.");
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:9595/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        // ✅ احفظ التوكين في localStorage
        localStorage.setItem("token", data.token);

        // (اختياري) لو حابب تخزن بيانات المستخدم
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

    
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-3/4 mx-auto border border-blue-300 py-8 rounded-xl mb-16">
      <div className="max-w-105 min-w-50 mx-auto px-4 flex flex-col items-center justify-center gap-6 mb-8 md:mb-16">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#80C1FE] to-[#58618E] bg-clip-text text-transparent">
          Log In
        </h1>

        <button className="w-full flex items-center justify-center space-x-2 bg-[#1a1c1f] hover:bg-[#222428] text-white py-2 rounded-lg border border-gray-700 mb-4">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-5 h-5"
            alt="Google"
          />
          <span>Continue with Google</span>
        </button>

        <div className="w-67 flex items-center">
          <div className="flex-grow border-t border-white"></div>
          <span className="mx-4 flex justify-center size-7.5 bg-white text-black text-lg font-bold rounded-full">
            or
          </span>
          <div className="flex-grow border-t border-white"></div>
        </div>

        <form className="flex flex-col gap-3 w-full" onSubmit={handleLogin}>
          <TextInput
            value={email}
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            value={password}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="text-white bg-gradient-to-r from-[#447399] via-[#5DA5E0] to-[#447399] py-3 rounded-xl hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className={`${roboto.className} font-light text-xl text-white`}>
          Don’t have an account?
          <Link
            href="/register"
            className="text-[#67E8FF] font-medium text-2xl ml-2"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default MainLogin;
