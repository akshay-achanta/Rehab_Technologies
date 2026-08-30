"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetMe, apiLogout } from "@/lib/api";
import { User, Phone, Mail, LogOut, Shield } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("rehab_token") || localStorage.getItem("rehab_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    apiGetMe()
      .then(setUser)
      .catch((err) => {
        setError("Failed to load profile. Please login again.");
        apiLogout();
        setTimeout(() => router.push("/login"), 2000);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    apiLogout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-app-bg">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-app-bg py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy-deep uppercase tracking-tight">
            My Profile
          </h1>
          <p className="text-concrete mt-2">View and manage your account details.</p>
        </div>

        {error ? (
          <div className="p-4 bg-danger/10 text-danger rounded-lg mb-6">{error}</div>
        ) : user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-navy-deep to-navy relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 bg-gold rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                  <User className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 pb-8 px-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-navy-deep">{user.name}</h2>
                  <div className="flex items-center text-sm font-medium text-gold mt-1 bg-gold/10 px-3 py-1 rounded-full w-fit">
                    <Shield className="w-4 h-4 mr-1.5" />
                    {user.role === "admin" ? "Administrator" : "Client Account"}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg text-sm font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-concrete mr-4">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-concrete uppercase tracking-wider font-bold mb-0.5">Mobile Number</div>
                    <div className="text-navy font-medium">{user.mobile}</div>
                  </div>
                </div>
                
                {user.email && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-concrete mr-4">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-concrete uppercase tracking-wider font-bold mb-0.5">Email Address</div>
                      <div className="text-navy font-medium">{user.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
