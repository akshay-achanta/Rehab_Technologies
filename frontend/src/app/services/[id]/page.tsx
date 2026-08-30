"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiGetServices, apiCreateRequest } from "@/lib/api";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RequestServicePage() {
  const router = useRouter();
  const params = useParams();
  const [service, setService] = useState<any>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ property_type: "Residential", location: "", preferred_date: "", notes: "" });

  useEffect(() => {
    const token = sessionStorage.getItem("rehab_token") || localStorage.getItem("rehab_token");
    if (!token) { router.push("/login"); return; }
    apiGetServices().then((services) => {
      const found = services.find((s: any) => s.id === params.id);
      if (!found) router.push("/services");
      else setService(found);
    });
  }, [router, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const req = await apiCreateRequest({
        service_id: service.id,
        property_type: formData.property_type,
        location: formData.location,
        preferred_date: formData.preferred_date || undefined,
        notes: formData.notes || undefined,
      });
      setSuccessId(req.id);
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) return null;

  if (successId) return (
    <div className="flex-grow flex items-center justify-center bg-app-bg px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-8 h-8 text-teal" /></div>
        <h2 className="font-heading text-2xl font-bold text-navy-deep mb-2">Request Submitted!</h2>
        <p className="text-concrete mb-6">Your service request has been received. Our team will review it shortly.</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 mb-8">
          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Request ID</span>
          <span className="font-mono text-lg font-bold text-navy-deep">{successId}</span>
        </div>
        <div className="space-y-3">
          <Link href="/my-requests" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-navy-deep bg-gold hover:bg-yellow-500 transition-colors">View My Requests</Link>
          <Link href="/services" className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors">Back to Services</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-grow bg-app-bg py-8 px-6 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/services" className="inline-flex items-center text-sm font-medium text-concrete hover:text-navy transition-colors mb-6"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Services</Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-navy p-6 md:p-8 text-white">
            <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2 uppercase">Request Service</h1>
            <p className="text-gold font-medium">{service.name}</p>
          </div>
          <div className="p-6 md:p-8">
            {error && <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Property Type</label>
                <select required className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm bg-white" value={formData.property_type} onChange={e => setFormData({ ...formData, property_type: e.target.value })}>
                  <option>Residential</option><option>Commercial</option><option>Industrial</option><option>Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">City / Location</label>
                <input type="text" required className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="e.g. Downtown, Mumbai" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Preferred Date (Optional)</label>
                <input type="date" className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" value={formData.preferred_date} onChange={e => setFormData({ ...formData, preferred_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Additional Notes</label>
                <textarea rows={4} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm resize-none" placeholder="Briefly describe the issue..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-base font-bold text-navy-deep bg-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors disabled:opacity-60">
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
