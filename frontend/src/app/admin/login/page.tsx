"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiAdminLogin } from "@/lib/api";
import { Lock, Phone, ChevronRight, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ mobile: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiAdminLogin(formData.mobile, formData.password);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-navy-deep px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gold py-6 text-center">
          <div className="mx-auto w-12 h-12 bg-navy rounded-full flex items-center justify-center text-gold mb-3"><ShieldAlert className="w-6 h-6" /></div>
          <h2 className="font-heading text-2xl font-bold text-navy-deep tracking-widest uppercase">Admin Access</h2>
          <p className="text-sm text-navy-deep/80 mt-1 font-medium">Rehab Technologies Portal</p>
        </div>
        <div className="p-8">
          {error && <div className="mb-6 p-3 bg-danger/10 text-danger text-sm font-medium rounded-lg border border-danger/20 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Admin Mobile / ID</label>
              <div className="relative">
                <Phone className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-concrete" />
                <input type="tel" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy sm:text-sm" placeholder="Enter admin identifier" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-concrete" />
                <input type="password" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy sm:text-sm" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-navy hover:bg-navy-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy transition-colors mt-8 disabled:opacity-60">
              {loading ? "Authenticating..." : "Secure Login"} {!loading && <ChevronRight className="ml-2 w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
