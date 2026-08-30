"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGetMyRequests } from "@/lib/api";
import { ClipboardList, ChevronRight, Clock, CheckCircle2, Circle } from "lucide-react";

const PIPELINE_STEPS = ["submitted", "assessed", "in_progress", "completed"];
const getStepLabel = (s: string) => ({ submitted: "Submitted", assessed: "Assessed", in_progress: "In Progress", completed: "Completed" }[s] || s);

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("rehab_token") || localStorage.getItem("rehab_token");
    if (!token) { router.push("/login"); return; }
    apiGetMyRequests()
      .then(setRequests)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="flex-grow flex items-center justify-center bg-app-bg">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-grow bg-app-bg py-8 px-6 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy-deep uppercase tracking-tight">My Requests</h1>
            <p className="text-concrete mt-2">Track the status of your structural repair service requests.</p>
          </div>
          <Link href="/services" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-md text-navy-deep bg-gold hover:bg-yellow-500 transition-colors shadow-sm">New Request</Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4 text-navy"><ClipboardList className="w-8 h-8" /></div>
            <h3 className="font-bold text-lg text-navy-deep mb-2">No requests yet</h3>
            <p className="text-concrete mb-6 max-w-md mx-auto">You haven't submitted any service requests yet.</p>
            <Link href="/services" className="inline-flex items-center text-sm font-bold text-gold hover:text-yellow-500 transition-colors">Browse Services <ChevronRight className="w-4 h-4 ml-1" /></Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => {
              const currentStepIndex = PIPELINE_STEPS.indexOf(req.status);
              const date = new Date(req.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
              return (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{req.id}</span>
                          <span className="text-sm text-concrete flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {date}</span>
                        </div>
                        <h3 className="font-heading text-xl md:text-2xl font-bold text-navy-deep">{req.service?.name || "Unknown Service"}</h3>
                      </div>
                      <span className={`inline-flex text-sm px-3 py-1 rounded-full font-medium w-max ${req.status === "completed" ? "bg-teal/10 text-teal" : req.status === "in_progress" ? "bg-gold/10 text-gold" : "bg-navy/10 text-navy"}`}>
                        {getStepLabel(req.status)}
                      </span>
                    </div>
                    {/* Pipeline */}
                    <div className="relative mt-10">
                      <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 rounded-full" />
                      <div className="absolute top-4 left-0 h-1 bg-navy rounded-full transition-all duration-500" style={{ width: `${(currentStepIndex / (PIPELINE_STEPS.length - 1)) * 100}%` }} />
                      <div className="relative flex justify-between">
                        {PIPELINE_STEPS.map((step, idx) => {
                          const done = idx < currentStepIndex;
                          const current = idx === currentStepIndex;
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${done ? "bg-navy text-white" : current ? "bg-gold text-navy-deep border-2 border-gold shadow-[0_0_10px_rgba(232,169,60,0.5)]" : "bg-white text-gray-300 border-2 border-gray-200"}`}>
                                {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-3 h-3 fill-current" />}
                              </div>
                              <span className={`mt-3 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center max-w-[70px] ${done ? "text-navy" : current ? "text-gold" : "text-gray-400"}`}>{getStepLabel(step)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <div><span className="text-gray-500 font-medium">Property:</span> <span className="text-navy font-semibold">{req.property_type}</span></div>
                    <div><span className="text-gray-500 font-medium">Location:</span> <span className="text-navy font-semibold">{req.location}</span></div>
                    {req.preferred_date && <div><span className="text-gray-500 font-medium">Pref. Date:</span> <span className="text-navy font-semibold">{req.preferred_date}</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
