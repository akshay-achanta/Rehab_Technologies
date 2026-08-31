"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiEmployeeLogin } from "@/lib/api";
import { Lock, Phone, ChevronRight, UserCircle } from "lucide-react";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ mobile: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiEmployeeLogin(formData.mobile, formData.password);
      router.push("/employee");
    } catch (err: any) {
      setError(err.message || "Invalid employee credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-navy py-6 text-center">
          <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white mb-3"><UserCircle className="w-6 h-6" /></div>
          <h2 className="font-heading text-2xl font-bold text-white tracking-widest uppercase">Employee Portal</h2>
          <p className="text-sm text-white/80 mt-1 font-medium">Rehab Technologies</p>
        </div>
        <div className="p-8">
          {error && <div className="mb-6 p-3 bg-danger/10 text-danger text-sm font-medium rounded-lg border border-danger/20 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-deep mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
                <input type="tel" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy sm:text-sm" placeholder="Enter your mobile number" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-deep mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
                <input type="password" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy sm:text-sm" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-navy hover:bg-navy-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy transition-colors mt-8 disabled:opacity-60">
              {loading ? "Authenticating..." : "Login"} {!loading && <ChevronRight className="ml-2 w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
