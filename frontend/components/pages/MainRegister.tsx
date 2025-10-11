"use client"
import Link from "next/link"
import React, { useState } from "react";
import { Roboto } from "next/font/google";
import TextInput from "@/components/ui/TextInput";
import {useRouter} from "next/navigation";
const roboto = Roboto({ subsets: ["latin"], weight: ["300"] });


const MainRegister = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [role, setRole] = useState("none");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    // ✅ Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ✅ Password conditions regex
    const hasUppercase = /[A-Z]/;
    const hasNumber = /\d/;
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const minLength = /.{8,}/;

    // ✅ Validation flags
    const emailValid = emailRegex.test(email);
    const upperValid = hasUppercase.test(password);
    const numberValid = hasNumber.test(password);
    const specialValid = hasSpecial.test(password);
    const lengthValid = minLength.test(password);
    const passwordsMatch = password === confirm && password !== "";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!emailValid) return setError("❌ Please enter a valid email.");
        if (!upperValid || !numberValid || !specialValid || !lengthValid)
            return setError("❌ Password does not meet the required conditions.");
        if (!passwordsMatch) return setError("❌ Passwords do not match.");

        

        try {
            setLoading(true);
            const res = await fetch("http://localhost:9595/api/v1/auth/signup", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, username, password, role})
            });

            if (res.ok) {
                router.push("/check-email");
            }
        } catch(err: any) {
            setError(err.message || "Something Went Wrong");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="w-3/4 mx-auto border border-blue-300 py-8 rounded-xl mb-16">
        <div className="max-w-105 min-w-50 mx-auto px-4 flex flex-col items-center justify-center gap-6 mb-8 md:mb-16">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#80C1FE] to-[#58618E] bg-clip-text text-transparent">Sign Up</h1>
            <button className="w-full flex items-center justify-center space-x-2 bg-[#1a1c1f] hover:bg-[#222428] text-white py-2 rounded-lg border border-gray-700 mb-4">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span>Continue with Google</span>
            </button>
            <div className="w-67 flex items-center">
                <div className="flex-grow border-t border-white"></div>
                <span className="mx-4 flex justify-center size-7.5 bg-white text-black text-lg font-bold rounded-full">
                    or
                </span>
                <div className="flex-grow border-t border-white"></div>
            </div>
            <form className="flex flex-col gap-3 w-full" onSubmit={handleRegister}>
                <TextInput 
                value={username} 
                type="text" 
                placeholder="User Name"
                onChange={(e) => {setUsername(e.target.value)}} />
                <TextInput
                    value={email}
                    type="email"
                    placeholder="Email"
                    onChange={(e) => {setEmail(e.target.value)}}
                />
                <TextInput 
                value={password} 
                type="password" 
                placeholder="Password" 
                onChange={(e) => {setPassword(e.target.value)}}/>
                <TextInput 
                value={confirm} 
                type="password" 
                placeholder="Confirm Password"
                onChange={(e) => {setConfirm(e.target.value)}} />
                <select 
                    className="bg-[#151726]/80 text-white/80 px-3 w-full py-2 rounded-xl"
                    value={role}
                    onChange={(e) => {
                        setRole(e.target.value);
                        console.log(e.target.value)
                    }}
                >
                    <option value="none" disabled defaultChecked>Choose Role:</option>
                    <option value='STUDENT'>Student</option>
                    <option value='INSTRUCTOR'>Instructor</option>
                </select>
                <button
                    type="submit"
                    className="text-white bg-gradient-to-r from-[#447399] via-[#5DA5E0] to-[#447399] py-3 rounded-xl"
                >
                    Create Account
                </button>
            </form>

            {/* ✅ Password condition checklist */}
        <div className="text-sm text-gray-700 space-y-1 mb-4">
          <p className={lengthValid ? "text-green-600" : "text-gray-500"}>
            {lengthValid ? "✔" : "•"} At least 8 characters
          </p>
          <p className={upperValid ? "text-green-600" : "text-gray-500"}>
            {upperValid ? "✔" : "•"} One uppercase letter (A–Z)
          </p>
          <p className={numberValid ? "text-green-600" : "text-gray-500"}>
            {numberValid ? "✔" : "•"} One number (0–9)
          </p>
          <p className={specialValid ? "text-green-600" : "text-gray-500"}>
            {specialValid ? "✔" : "•"} One special character (!, @, #, $, ...)
          </p>
          <p className={passwordsMatch ? "text-green-600" : "text-gray-500"}>
            {passwordsMatch ? "✔" : "•"} Passwords match
          </p>
        </div>
            <p className={`${roboto.className}font-light text-xl text-white`}>
                Already have an account? <Link href="/login" className="text-[#67E8FF] font-medium text-2xl ml-2">Login</Link>
            </p>
        </div>
        </div>
    )
}

export default MainRegister