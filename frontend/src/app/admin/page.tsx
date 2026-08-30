"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGetAllRequests, apiUpdateRequestStatus, apiGetAllServices, apiUpdateService, apiDeleteService } from "@/lib/api";
import { LayoutDashboard, Settings, Edit, Trash2, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"requests" | "services">("requests");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    const token = sessionStorage.getItem("rehab_admin_token") || localStorage.getItem("rehab_admin_token");
    if (!token) { router.push("/admin/login"); return; }
    try {
      const data = await apiGetAllRequests(statusFilter !== "all" ? statusFilter : undefined);
      setRequests(data);
    } catch { router.push("/admin/login"); }
    finally { setLoading(false); }
  }, [statusFilter, router]);

  const loadServices = useCallback(async () => {
    try { setServices(await apiGetAllServices()); } catch {}
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);
  useEffect(() => { if (activeTab === "services") loadServices(); }, [activeTab, loadServices]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await apiUpdateRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e: any) { alert(e.message); }
    finally { setUpdating(null); }
  };

  const handleToggleService = async (service: any) => {
    await apiUpdateService(service.id, { is_active: !service.is_active });
    loadServices();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await apiDeleteService(id);
    loadServices();
  };

  const stats = {
    total: requests.length,
    submitted: requests.filter(r => r.status === "submitted").length,
    inProgress: requests.filter(r => r.status === "in_progress" || r.status === "assessed").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center bg-navy-deep">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-app-bg">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-navy-deep text-white flex-shrink-0 p-6">
        <h2 className="font-heading text-xl font-bold mb-8 text-gold tracking-wider">ADMIN CONSOLE</h2>
        <nav className="space-y-2">
          {([["requests", LayoutDashboard, "Requests"], ["services", Settings, "Manage Services"]] as const).map(([tab, Icon, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={clsx("w-full flex items-center px-4 py-3 rounded-lg text-sm font-bold transition-colors", activeTab === tab ? "bg-navy text-white" : "text-gray-400 hover:text-white hover:bg-navy/50")}>
              <Icon className="w-5 h-5 mr-3" /> {label}
            </button>
          ))}
        </nav>
        <button onClick={() => { localStorage.removeItem("rehab_admin_token"); router.push("/admin/login"); }} className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-danger mt-12 transition-colors font-bold">Logout Admin</button>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 md:p-10 overflow-auto">
        {activeTab === "requests" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading text-3xl font-bold text-navy-deep uppercase">Service Requests</h1>
              <button onClick={loadRequests} className="flex items-center gap-2 text-sm font-bold text-concrete hover:text-navy transition-colors"><RefreshCw className="w-4 h-4" /> Refresh</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[["Total", stats.total, "text-navy-deep"], ["Submitted", stats.submitted, "text-danger"], ["In Progress", stats.inProgress, "text-gold"], ["Completed", stats.completed, "text-teal"]].map(([label, val, cls]) => (
                <div key={label as string} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className={`text-3xl font-mono font-bold ${cls}`}>{val as number}</div>
                  <div className="text-xs font-bold text-concrete uppercase tracking-wider mt-1">{label as string}</div>
                </div>
              ))}
            </div>

            {/* Filter + Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
                <select className="bg-white border border-gray-300 text-sm rounded-lg p-2 font-medium focus:ring-gold focus:border-gold" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="assessed">Assessed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">ID / Date</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4">Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No requests found.</td></tr>
                    ) : requests.map(req => (
                      <tr key={req.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-navy-deep">{req.id}</div>
                          <div className="text-xs mt-1">{new Date(req.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-navy-deep">{req.user?.name || "—"}</div>
                          <div className="text-xs text-concrete">{req.user?.mobile}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-navy-deep">{req.service?.name}</td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-xs"><span className="font-semibold text-gray-700">Type:</span> {req.property_type}</div>
                          <div className="text-xs truncate"><span className="font-semibold text-gray-700">Loc:</span> {req.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select className="bg-white border border-gray-300 text-xs rounded-lg p-1.5 focus:ring-gold focus:border-gold" value={req.status}
                              onChange={e => handleStatusChange(req.id, e.target.value)}
                              disabled={updating === req.id}>
                              <option value="submitted">Submitted</option>
                              <option value="assessed">Assessed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            {updating === req.id && <span className="text-xs text-concrete animate-pulse">Saving…</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div>
            <h1 className="font-heading text-3xl font-bold text-navy-deep uppercase mb-8">Manage Services</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-navy-deep">{service.name}</td>
                      <td className="px-6 py-4 text-xs">{service.description}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleToggleService(service)} className={clsx("px-3 py-1 text-xs font-bold rounded-full", service.is_active ? "bg-teal/10 text-teal" : "bg-gray-100 text-gray-500")}>
                          {service.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleDeleteService(service.id)} className="p-2 text-gray-400 hover:text-danger bg-gray-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
