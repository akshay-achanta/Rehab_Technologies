"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, apiRegister } from "@/lib/api";
import { Lock, Phone, User, Mail, ChevronRight } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await apiLogin(formData.mobile, formData.password);
      } else {
        await apiRegister({ name: formData.name, mobile: formData.mobile, email: formData.email, password: formData.password });
      }
      router.push("/services");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-app-bg px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${isLogin ? "text-navy-deep border-b-2 border-gold bg-white" : "text-concrete hover:text-navy"}`}>Log In</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${!isLogin ? "text-navy-deep border-b-2 border-gold bg-white" : "text-concrete hover:text-navy"}`}>Register</button>
        </div>
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-navy-deep">{isLogin ? "WELCOME BACK" : "CREATE ACCOUNT"}</h2>
            <p className="text-sm text-concrete mt-1">{isLogin ? "Enter your details to access your portal." : "Sign up to request and track structural services."}</p>
          </div>
          {error && <div className="mb-6 p-3 bg-danger/10 text-danger text-sm font-medium rounded-lg border border-danger/20">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-concrete" />
                    <input type="text" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-concrete" />
                    <input type="email" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-concrete" />
                <input type="tel" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="10-digit number" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-concrete" />
                <input type="password" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-navy-deep bg-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors mt-8 disabled:opacity-60">
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              {!loading && <ChevronRight className="ml-2 w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
