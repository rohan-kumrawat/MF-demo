// src/feature/admin/audit-logs/pages/AuditLogsPage.tsx
import { Loader2, History, User, Activity, Database } from "lucide-react";
import { useAuditLogs } from "../hooks/useAuditLogs";

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useAuditLogs();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#005eb0]" />
        <p className="text-xs font-bold text-[#717784] uppercase tracking-widest">
          Loading Logs...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#001e40]/10 flex items-center justify-center text-[#001e40]">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2
            className="text-xl font-black text-[#121c28]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Audit Logs
          </h2>
          <p className="text-xs text-[#717784] font-medium">
            Track all actions in your centre
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-ambient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f9ff]">
                {["Action", "User", "Table", "ID", "Date", "Details"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-[10px] font-extrabold text-[#43474f] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c1c6d5]/10">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm font-bold text-[#717784]"
                  >
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#f8f9ff] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          log.action === "CREATE"
                            ? "bg-[#006c49]/10 text-[#006c49]"
                            : log.action === "UPDATE"
                              ? "bg-[#005eb0]/10 text-[#005eb0]"
                              : "bg-[#ba1a1a]/10 text-[#ba1a1a]"
                        }`}
                      >
                        <Activity className="w-3 h-3" /> {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#717784]" />
                        <span className="text-xs font-bold text-[#121c28]">
                          {log.userId.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-[#005eb0]" />
                        <span className="text-xs font-black text-[#005eb0] uppercase tracking-tighter">
                          {log.tableName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-[#717784]">
                      {log.recordId.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#43474f]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[10px] font-bold text-[#005eb0] hover:underline uppercase tracking-widest">
                        View Data
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
