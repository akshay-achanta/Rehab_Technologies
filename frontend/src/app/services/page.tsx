"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGetServices } from "@/lib/api";
import { ClipboardCheck, Search, Wrench, Shield, HomeIcon, LineChart, ChevronRight } from "lucide-react";

const iconMap: Record<string, any> = { ClipboardCheck, Search, Wrench, Shield, HomeIcon, LineChart };

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("rehab_token") || localStorage.getItem("rehab_token");
    if (!token) { router.push("/login"); return; }
    apiGetServices()
      .then(setServices)
      .catch(() => setError("Failed to load services."))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="flex-grow flex items-center justify-center bg-app-bg">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-navy-deep font-medium">Loading services...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-grow bg-app-bg py-8 px-6 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy-deep uppercase tracking-tight">Select a Service</h1>
          <p className="text-concrete mt-2">Choose a service below to start a new request.</p>
        </div>
        {error && <div className="p-4 bg-danger/10 text-danger rounded-lg mb-6">{error}</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Wrench;
            return (
              <Link key={service.id} href={`/services/${service.id}`} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gold/50 transition-all group flex flex-col">
                <div className="w-12 h-12 bg-navy/5 text-navy rounded-lg flex items-center justify-center mb-5 group-hover:bg-navy group-hover:text-gold transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-deep mb-2">{service.name}</h3>
                <p className="text-concrete text-sm mb-6 flex-grow">{service.description}</p>
                <div className="flex items-center text-sm font-bold text-gold group-hover:text-yellow-500 transition-colors mt-auto">
                  REQUEST SERVICE <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
