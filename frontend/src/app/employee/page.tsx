"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGetAssignedRequests, apiUpdateEmployeeRequestStatus, apiGetMe } from "@/lib/api";
import { LayoutDashboard, LogOut, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [employee, setEmployee] = useState<any>(null);

  const loadDashboard = useCallback(async () => {
    const token = sessionStorage.getItem("rehab_token") || localStorage.getItem("rehab_token");
    if (!token) { router.push("/employee/login"); return; }
    try {
      const me = await apiGetMe();
      if (me.role !== "employee") throw new Error("Not an employee");
      setEmployee(me);
      
      const data = await apiGetAssignedRequests();
      setRequests(data);
    } catch { 
      router.push("/employee/login"); 
    } finally { 
      setLoading(false); 
    }
  }, [router]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await apiUpdateEmployeeRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e: any) { alert(e.message); }
    finally { setUpdating(null); }
  };

  const stats = {
    total: requests.length,
    inProgress: requests.filter(r => r.status === "in_progress" || r.status === "assessed").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-app-bg">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-navy-deep text-white flex-shrink-0 p-6 flex flex-col">
        <h2 className="font-heading text-xl font-bold mb-8 text-gold tracking-wider">EMPLOYEE PORTAL</h2>
        <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="font-bold text-sm">{employee?.name}</div>
          <div className="text-xs text-gray-400 mt-1">{employee?.department || "General Dept"}</div>
        </div>
        <nav className="space-y-2 flex-grow">
          <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-bold transition-colors bg-navy text-white">
            <LayoutDashboard className="w-5 h-5 mr-3" /> My Tasks
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">



        <div className="p-6 md:p-10 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold text-navy-deep uppercase">Tasks Overview</h1>
            <button onClick={loadDashboard} className="flex items-center gap-2 text-sm font-bold text-concrete hover:text-navy transition-colors"><RefreshCw className="w-4 h-4" /> Refresh</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[["Total Assigned", stats.total, "text-navy-deep"], ["Active / In Progress", stats.inProgress, "text-gold"], ["Completed", stats.completed, "text-teal"]].map(([label, val, cls]) => (
              <div key={label as string} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className={`text-3xl font-mono font-bold ${cls}`}>{val as number}</div>
                <div className="text-xs font-bold text-concrete uppercase tracking-wider mt-1">{label as string}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Service Details</th>
                    <th className="px-6 py-4">Status Update</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No tasks assigned to you.</td></tr>
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
                      <td className="px-6 py-4">
                        <div className="font-bold text-navy-deep mb-1">{req.service?.name}</div>
                        <div className="text-xs"><span className="font-semibold text-gray-700">Type:</span> {req.property_type}</div>
                        <div className="text-xs"><span className="font-semibold text-gray-700">Loc:</span> {req.location}</div>
                        {req.notes && <div className="text-xs mt-1 text-gray-400 italic">Notes: {req.notes}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select className="bg-white border border-gray-300 text-xs rounded-lg p-1.5 focus:ring-gold focus:border-gold" value={req.status}
                            onChange={e => handleStatusChange(req.id, e.target.value)}
                            disabled={updating === req.id || req.status === "completed"}>
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
      </div>
    </div>
  );
}
