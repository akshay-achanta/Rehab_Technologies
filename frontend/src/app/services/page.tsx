"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGetServices } from "@/lib/api";
import { ClipboardCheck, Search, Wrench, Shield, Home as HomeIcon, LineChart, ChevronRight, Layers } from "lucide-react";

const iconMap: Record<string, any> = { ClipboardCheck, Search, Wrench, Shield, HomeIcon, LineChart };

const serviceColors = [
  { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-700",   accent: "border-blue-200 hover:border-blue-400" },
  { bg: "bg-amber-50",  icon: "bg-amber-100 text-amber-700", accent: "border-amber-200 hover:border-amber-400" },
  { bg: "bg-teal-50",   icon: "bg-teal-100 text-teal-700",   accent: "border-teal-200 hover:border-teal-400" },
  { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-700", accent: "border-purple-200 hover:border-purple-400" },
  { bg: "bg-rose-50",   icon: "bg-rose-100 text-rose-700",   accent: "border-rose-200 hover:border-rose-400" },
  { bg: "bg-emerald-50",icon: "bg-emerald-100 text-emerald-700", accent: "border-emerald-200 hover:border-emerald-400" },
];

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
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-navy-deep font-medium text-sm">Loading services...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-grow bg-app-bg">
      {/* Hero Banner */}
      <div className="bg-navy-deep text-white py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" /> Our Services
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
            Choose Your Service
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Select any service below to submit a request. Our expert team will review and get back to you promptly.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {error && (
          <div className="p-4 bg-danger/10 text-danger rounded-xl mb-6 text-sm font-medium">{error}</div>
        )}

        {services.length === 0 && !error && (
          <div className="text-center py-20 text-concrete">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No services available at the moment.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] || Wrench;
            const color = serviceColors[i % serviceColors.length];
            return (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className={`group bg-white rounded-2xl border-2 ${color.accent} shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden`}
              >
                {/* Card top accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r from-gold to-yellow-400`} />

                <div className="p-6 flex flex-col flex-grow">
                  {/* Icon */}
                  <div className={`w-14 h-14 ${color.icon} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-lg font-bold text-navy-deep mb-2 group-hover:text-gold transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-concrete text-sm leading-relaxed flex-grow mb-5">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-concrete uppercase tracking-wider">Request Now</span>
                    <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center group-hover:bg-gold group-hover:text-navy-deep transition-colors">
                      <ChevronRight className="w-4 h-4 text-navy group-hover:text-navy-deep transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom info */}
        <div className="mt-12 bg-navy-deep rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-white">
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <ClipboardCheck className="w-6 h-6 text-gold" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-bold mb-1">Not sure which service you need?</div>
            <div className="text-sm text-gray-400">Call us at <span className="text-gold font-semibold">+91 98490 00463</span> or WhatsApp us — we&apos;ll guide you to the right service.</div>
          </div>
          <a href="tel:+919849000463" className="flex-shrink-0 bg-gold hover:bg-yellow-400 text-navy-deep text-sm font-bold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
            Call Us
          </a>
        </div>
      </div>
    </div>
  );
}
