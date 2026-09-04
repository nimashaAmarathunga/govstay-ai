"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Loader2, AlertCircle, Building2, User, Mail, Phone, Lock, Hash } from "lucide-react";
import { useUser, AppUser } from "@/components/context/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { setActiveUser, checkAuthSession } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    emailAddress: "",
    mobileNumber: "",
    username: "",
    password: "",
    placeOfWork: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your details.");
        setLoading(false);
        return;
      }

      setActiveUser(data.user as AppUser);
      await checkAuthSession();

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex flex-col justify-center items-center p-4 py-12 relative overflow-y-auto">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative h-12 w-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="GovSewana Logo" fill className="object-contain mix-blend-multiply" priority />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">GovSewana</h1>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Create Account</p>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10"
      >
        <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <span>Register New Account</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Join the official government accommodation platform</p>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. Kasun Perera" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. kasun_p" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
                <input type="email" name="emailAddress" required value={formData.emailAddress} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="user@gov.lk" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Phone className="w-4 h-4" /></div>
                <input type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="07XXXXXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Employee ID (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Hash className="w-4 h-4" /></div>
                <input type="text" name="empId" value={formData.empId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. 245503B" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Department / Ministry</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Building2 className="w-4 h-4" /></div>
                <input type="text" name="placeOfWork" required value={formData.placeOfWork} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Ministry of Public Administration" />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="••••••••••••" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Registering...</span></>
            ) : (
              <><UserPlus className="w-4 h-4" /><span>Complete Registration</span></>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-bold text-blue-600 hover:text-blue-700">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
