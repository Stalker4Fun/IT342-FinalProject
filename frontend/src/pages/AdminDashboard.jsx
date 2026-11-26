import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingRecipients, setPendingRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/recipients?status=pending'),
      ]);
      setStats(statsRes.data);
      setPendingRecipients(pendingRes.data);
    } catch {
      setError('Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (userId, orgName) => {
    setActionLoading(userId);
    try {
      await api.patch(`/api/admin/recipients/${userId}/verify`);
      setToastMessage(`Successfully approved charity "${orgName}"!`);
      setTimeout(() => setToastMessage(''), 4000);
      await loadData();
    } catch {
      alert('Failed to approve charity. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading admin operations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast message */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time platform metrics and verification queues
          </p>
        </div>

        <Link
          to="/admin/recipients"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>Manage All Recipients</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">{stats?.totalUsers ?? 0}</p>
          <span className="text-[11px] text-slate-400">All registered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Donors</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1.5">{stats?.totalDonors ?? 0}</p>
          <span className="text-[11px] text-amber-600/80">Active businesses</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Recipients</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1.5">{stats?.totalRecipients ?? 0}</p>
          <span className="text-[11px] text-blue-600/80">Charities & shelters</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/30 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1.5">{stats?.pendingRecipients ?? 0}</p>
          <span className="text-[11px] text-amber-700 font-semibold">Needs review (FR-001.2)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Approved</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1.5">{stats?.approvedRecipients ?? 0}</p>
          <span className="text-[11px] text-emerald-700">Eligible to claim</span>
        </div>
      </div>

      {/* Pending Approval Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Charity Verification Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recipients awaiting administrative approval before food claiming is enabled
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
            {pendingRecipients.length} Pending
          </span>
        </div>

        {pendingRecipients.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">Verification queue is clear!</p>
            <p className="text-xs text-slate-500 mt-0.5">
              All registered charitable organizations have been reviewed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Address</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRecipients.map((recip) => (
                  <tr key={recip.userId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{recip.name}</p>
                      <p className="text-xs text-slate-500">{recip.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {recip.contactNumber}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {recip.address}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApprove(recip.userId, recip.name)}
                        disabled={actionLoading === recip.userId}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === recip.userId ? 'Approving...' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
