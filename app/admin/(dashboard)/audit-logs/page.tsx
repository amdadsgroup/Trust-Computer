import React from 'react';
import prisma from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Shield, Clock, User, Filter, AlertCircle, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams?: { action?: string; entityType?: string; page?: string };
}) {
  await requireRole(['OWNER', 'ADMIN']);

  const actionFilter = searchParams?.action || '';
  const entityTypeFilter = searchParams?.entityType || '';
  const currentPage = parseInt(searchParams?.page || '1', 10) || 1;
  const pageSize = 25;

  const where: any = {};
  if (actionFilter) where.action = actionFilter;
  if (entityTypeFilter) where.entityType = entityTypeFilter;

  let totalLogs = 0;
  let logs: any[] = [];

  try {
    const [fetchedTotal, fetchedLogs] = await Promise.all([
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
        },
      }),
    ]);
    totalLogs = fetchedTotal;
    logs = fetchedLogs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
  }

  const totalPages = Math.ceil(totalLogs / pageSize);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            অডিট ট্রেইল ও লগ (Audit Trail & Activity Logs)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            সিস্টেমে পণ্যের মূল্য, স্টক, অর্ডার ও সেটিংসের সমস্ত প্রশাসনিক পরিবর্তনের অপরিবর্তনীয় রেকর্ড।
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-brand rounded-xl border border-blue-200">
          মোট ইভেন্ট রেকর্ড: {totalLogs} টি
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand" />
            <span>প্রশাসনিক কার্যক্রম তালিকা</span>
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">সময় ও তারিখ</th>
                  <th className="p-4">অ্যাকশন</th>
                  <th className="p-4">এনটিটি</th>
                  <th className="p-4">অ্যাডমিন / ইউজার</th>
                  <th className="p-4">বিস্তারিত তথ্য</th>
                  <th className="p-4">IP অ্যাড্রেস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  let parsedDetails: any = null;
                  if (log.detailsJson) {
                    try {
                      parsedDetails = JSON.parse(log.detailsJson);
                    } catch {
                      parsedDetails = log.detailsJson;
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString('en-GB')}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-medium text-slate-700">
                        {log.entityType}
                        {log.entityId && (
                          <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {log.user ? (
                          <div>
                            <p className="font-bold text-slate-800">{log.user.name}</p>
                            <p className="text-[10px] text-slate-400">{log.user.email} ({log.user.role})</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">System / Anonymous</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs break-words">
                        {parsedDetails ? (
                          typeof parsedDetails === 'object' ? (
                            <div className="space-y-0.5 text-[11px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                              {Object.entries(parsedDetails).map(([k, v]) => (
                                <div key={k} className="truncate">
                                  <span className="text-slate-400">{k}:</span> <strong className="text-slate-700">{String(v)}</strong>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="font-mono text-[11px]">{String(parsedDetails)}</span>
                          )
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {log.ipAddress || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              পৃষ্ঠা {currentPage} এর {totalPages}
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <a
                  href={`/admin/audit-logs?page=${currentPage - 1}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  আগের পৃষ্ঠা
                </a>
              )}
              {currentPage < totalPages && (
                <a
                  href={`/admin/audit-logs?page=${currentPage + 1}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  পরের পৃষ্ঠা
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
