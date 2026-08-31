"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  apiGetAllRequests, apiUpdateRequestStatus, 
  apiGetAllServices, apiUpdateService, apiDeleteService,
  apiGetEmployees, apiCreateEmployee, apiUpdateEmployee, apiDeleteEmployee, apiAssignEmployees
} from "@/lib/api";
import { LayoutDashboard, Settings, Edit, Trash2, RefreshCw, Users, UserPlus, LogOut, UserCheck, X, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

// --- Toast Notification Component ---
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={clsx(
      "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 animate-[slideUp_0.3s_ease-out]",
      type === "success" ? "bg-teal" : "bg-danger"
    )}>
      {type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"requests" | "services" | "employees">("requests");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });

  // Employee Form State
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [empForm, setEmpForm] = useState({ id: "", name: "", mobile: "", email: "", password: "", department: "" });
  const [empFormError, setEmpFormError] = useState("");
  const [empSaving, setEmpSaving] = useState(false);

  // Assignment State
  const [assigningReq, setAssigningReq] = useState<any | null>(null);
  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

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

  const loadEmployees = useCallback(async () => {
    try { setEmployees(await apiGetEmployees()); } catch {}
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);
  useEffect(() => { if (activeTab === "services") loadServices(); }, [activeTab, loadServices]);
  useEffect(() => { if (activeTab === "employees" || activeTab === "requests") loadEmployees(); }, [activeTab, loadEmployees]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await apiUpdateRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast("Status updated successfully");
    } catch (e: any) { 
      showToast(e.message || "Failed to update status", "error"); 
    }
    finally { setUpdating(null); }
  };

  const handleToggleService = async (service: any) => {
    try {
      await apiUpdateService(service.id, { is_active: !service.is_active });
      loadServices();
      showToast(`Service ${service.is_active ? "deactivated" : "activated"}`);
    } catch (e: any) { showToast(e.message, "error"); }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await apiDeleteService(id);
      loadServices();
      showToast("Service deleted");
    } catch (e: any) { showToast(e.message, "error"); }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmpFormError("");
    setEmpSaving(true);
    try {
      if (empForm.id) {
        const { id, ...updateData } = empForm;
        if (!updateData.password) delete (updateData as any).password;
        await apiUpdateEmployee(id, updateData);
        showToast(`Employee "${empForm.name}" updated successfully`);
      } else {
        const { id, ...createData } = empForm;
        await apiCreateEmployee(createData);
        showToast(`Employee "${empForm.name}" added successfully`);
      }
      setShowEmpForm(false);
      loadEmployees();
    } catch (err: any) {
      setEmpFormError(err.message || "Error saving employee");
    } finally {
      setEmpSaving(false);
    }
  };

  const handleDeleteEmployee = async (emp: any) => {
    if (!confirm(`Delete employee "${emp.name}"?`)) return;
    try {
      await apiDeleteEmployee(emp.id);
      loadEmployees();
      showToast(`Employee "${emp.name}" removed`);
    } catch (err: any) { showToast(err.message, "error"); }
  };

  const openAssignModal = (req: any) => {
    setAssigningReq(req);
    // Pre-select currently assigned employees
    setSelectedEmps(req.assignments?.map((a: any) => a.employee.id) || []);
  };

  const handleSaveAssignments = async () => {
    if (!assigningReq) return;
    setAssigning(true);
    try {
      const updated = await apiAssignEmployees(assigningReq.id, selectedEmps);
      // Update request in local state
      setRequests(prev => prev.map(r => r.id === assigningReq.id ? { ...r, assignments: updated.assignments } : r));
      setAssigningReq(null);
      const count = selectedEmps.length;
      showToast(count === 0 ? "All assignments removed" : `${count} employee${count > 1 ? "s" : ""} assigned successfully`);
    } catch (err: any) { 
      showToast(err.message || "Failed to save assignments", "error"); 
    } finally {
      setAssigning(false);
    }
  };

  const toggleEmp = (id: string) => {
    setSelectedEmps(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
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
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-navy-deep text-white flex-shrink-0 p-6 flex flex-col">
        <h2 className="font-heading text-xl font-bold mb-8 text-gold tracking-wider">ADMIN CONSOLE</h2>
        <nav className="space-y-2 flex-grow">
          {([
            ["requests", LayoutDashboard, "Requests"], 
            ["services", Settings, "Manage Services"],
            ["employees", Users, "Employees"]
          ] as const).map(([tab, Icon, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={clsx("w-full flex items-center px-4 py-3 rounded-lg text-sm font-bold transition-colors", activeTab === tab ? "bg-navy text-white" : "text-gray-400 hover:text-white hover:bg-navy/50")}>
              <Icon className="w-5 h-5 mr-3" /> {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">


        <div className="p-6 md:p-10 overflow-auto">
          {/* ── Requests Tab ── */}
          {activeTab === "requests" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-heading text-3xl font-bold text-navy-deep uppercase">Service Requests</h1>
                <button onClick={loadRequests} className="flex items-center gap-2 text-sm font-bold text-concrete hover:text-navy transition-colors"><RefreshCw className="w-4 h-4" /> Refresh</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[["Total", stats.total, "text-navy-deep"], ["Submitted", stats.submitted, "text-danger"], ["In Progress", stats.inProgress, "text-gold"], ["Completed", stats.completed, "text-teal"]].map(([label, val, cls]) => (
                  <div key={label as string} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className={`text-3xl font-mono font-bold ${cls}`}>{val as number}</div>
                    <div className="text-xs font-bold text-concrete uppercase tracking-wider mt-1">{label as string}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
                  <select className="bg-white border border-gray-300 text-sm rounded-lg p-2 font-medium" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
                        <th className="px-6 py-4">Service Details</th>
                        <th className="px-6 py-4">Assignees</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No requests found.</td></tr>
                      ) : requests.map(req => (
                        <tr key={req.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-navy-deep text-xs">{req.id}</div>
                            <div className="text-xs mt-1 text-concrete">{new Date(req.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-navy-deep">{req.user?.name || "—"}</div>
                            <div className="text-xs text-concrete">{req.user?.mobile}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-navy-deep mb-1 text-xs">{req.service?.name}</div>
                            <div className="text-xs text-concrete">{req.property_type} · {req.location}</div>
                          </td>
                          <td className="px-6 py-4 min-w-[180px]">
                            {/* Assignee chips */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {req.assignments?.length > 0
                                ? req.assignments.map((a: any) => (
                                    <span key={a.id} className="inline-flex items-center gap-1 bg-navy/10 text-navy text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      {a.employee.name}
                                    </span>
                                  ))
                                : <span className="text-xs text-concrete italic">Unassigned</span>
                              }
                            </div>
                            <button
                              onClick={() => openAssignModal(req)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-yellow-600 transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              {req.assignments?.length > 0 ? "Edit Assignees" : "Assign Employees"}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className="bg-white border border-gray-300 text-xs rounded-lg p-1.5 focus:ring-gold focus:border-gold w-full"
                              value={req.status}
                              onChange={e => handleStatusChange(req.id, e.target.value)}
                              disabled={updating === req.id}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="assessed">Assessed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            {updating === req.id && <span className="text-[10px] text-concrete animate-pulse mt-1 block">Saving…</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Services Tab ── */}
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
                          <button onClick={() => handleToggleService(service)} className={clsx("px-3 py-1 text-xs font-bold rounded-full transition-colors", service.is_active ? "bg-teal/10 text-teal hover:bg-teal/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                            {service.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteService(service.id)} className="p-2 text-gray-400 hover:text-danger bg-gray-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Employees Tab ── */}
          {activeTab === "employees" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-heading text-3xl font-bold text-navy-deep uppercase">Employees</h1>
                <button
                  onClick={() => { setEmpForm({ id: "", name: "", mobile: "", email: "", password: "", department: "" }); setEmpFormError(""); setShowEmpForm(true); }}
                  className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-navy-deep transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Add Employee
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No employees yet. Click "Add Employee" to get started.</td></tr>
                    ) : employees.map(emp => (
                      <tr key={emp.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-navy-deep">{emp.name}</td>
                        <td className="px-6 py-4 text-xs">
                          <div>{emp.mobile}</div>
                          <div className="text-concrete">{emp.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-navy/10 text-navy px-3 py-1 rounded-full text-xs font-bold">{emp.department || "General"}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-concrete">{new Date(emp.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => { setEmpForm({ id: emp.id, name: emp.name, mobile: emp.mobile, email: emp.email, password: "", department: emp.department || "" }); setEmpFormError(""); setShowEmpForm(true); }}
                            className="p-2 text-gray-400 hover:text-navy bg-gray-50 rounded transition-colors"
                            title="Edit"
                          ><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteEmployee(emp)} className="p-2 text-gray-400 hover:text-danger bg-gray-50 rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

      {/* ── Employee Add/Edit Modal ── */}
      {showEmpForm && (
        <div className="fixed inset-0 bg-navy-deep/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={e => { if (e.target === e.currentTarget) { setShowEmpForm(false); setEmpFormError(""); } }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="bg-navy p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{empForm.id ? "Edit Employee" : "Add New Employee"}</h3>
              <button onClick={() => { setShowEmpForm(false); setEmpFormError(""); }} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              {empFormError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
                  ⚠ {empFormError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-navy-deep mb-1">Full Name</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm transition-shadow" placeholder="e.g. Rahul Sharma" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-deep mb-1">Phone Number</label>
                  <input required type="tel" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="10-digit number" value={empForm.mobile} onChange={e => setEmpForm({...empForm, mobile: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-deep mb-1">Department</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="e.g. Survey" value={empForm.department} onChange={e => setEmpForm({...empForm, department: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-deep mb-1">Email Address</label>
                <input required type="email" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="employee@company.com" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-deep mb-1">{empForm.id ? "New Password (leave blank to keep current)" : "Password"}</label>
                <input required={!empForm.id} minLength={6} type="password" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm" placeholder="Min 6 characters" value={empForm.password} onChange={e => setEmpForm({...empForm, password: e.target.value})} />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => { setShowEmpForm(false); setEmpFormError(""); }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-concrete hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={empSaving} className="flex-1 px-4 py-2.5 bg-gold hover:bg-yellow-500 rounded-lg text-sm font-bold text-navy-deep shadow-sm transition-colors disabled:opacity-60">
                  {empSaving ? "Saving..." : empForm.id ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assignment Modal ── */}
      {assigningReq && (
        <div className="fixed inset-0 bg-navy-deep/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={e => { if (e.target === e.currentTarget) setAssigningReq(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="bg-navy p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Assign Employees</h3>
                <p className="text-xs text-white/60 mt-0.5 font-mono">{assigningReq.id}</p>
              </div>
              <button onClick={() => setAssigningReq(null)} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {/* Currently assigned summary */}
              {selectedEmps.length > 0 && (
                <div className="mb-4 p-3 bg-navy/5 rounded-lg border border-navy/10">
                  <div className="text-xs font-bold text-navy-deep mb-2 uppercase tracking-wide">Selected ({selectedEmps.length})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmps.map(id => {
                      const emp = employees.find((e: any) => e.id === id);
                      return emp ? (
                        <span key={id} className="inline-flex items-center gap-1 bg-navy text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          {emp.name}
                          <button type="button" onClick={() => toggleEmp(id)} className="hover:text-red-300 transition-colors ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="text-xs font-bold text-concrete uppercase tracking-wide mb-2">All Employees</div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {employees.length === 0 ? (
                  <p className="text-sm text-center text-gray-500 py-4">No employees found. Add employees first.</p>
                ) : employees.map((emp: any) => {
                  const isSelected = selectedEmps.includes(emp.id);
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => toggleEmp(emp.id)}
                      className={clsx(
                        "w-full flex items-center p-3 rounded-lg border text-left transition-all duration-150",
                        isSelected
                          ? "border-navy bg-navy/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div className={clsx(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected ? "bg-navy border-navy" : "border-gray-300"
                      )}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-bold text-navy-deep">{emp.name}</div>
                        <div className="text-xs text-concrete">{emp.department || "General"} · {emp.mobile}</div>
                      </div>
                      {isSelected && <span className="text-[10px] text-navy font-bold bg-navy/10 px-2 py-0.5 rounded-full ml-2">Assigned</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setAssigningReq(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-concrete hover:bg-gray-50 transition-colors">Cancel</button>
                {selectedEmps.length > 0 && (
                  <button type="button" onClick={() => setSelectedEmps([])} className="px-4 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">Clear All</button>
                )}
                <button type="button" onClick={handleSaveAssignments} disabled={assigning} className="flex-1 px-4 py-2.5 bg-navy hover:bg-navy-deep rounded-lg text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-60">
                  {assigning ? "Saving..." : `Save (${selectedEmps.length} selected)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
