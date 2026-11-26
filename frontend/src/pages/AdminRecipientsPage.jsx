import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const AdminRecipientsPage = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRecipients = async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/admin/recipients?status=${status}`);
      setRecipients(res.data);
    } catch {
      setError('Failed to fetch recipients from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients(activeTab);
  }, [activeTab]);

  const handleVerify = async (userId, name) => {
    if (!window.confirm(`Approve charity "${name}" for surplus food claiming?`)) {
      return;
    }
    setActionUserId(userId);
    try {
      await api.patch(`/api/admin/recipients/${userId}/verify`);
      setToastMessage(`Charity "${name}" approved successfully.`);
      setTimeout(() => setToastMessage(''), 4000);
      await fetchRecipients(activeTab);
    } catch {
      alert('Failed to approve charity.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleRevoke = async (userId, name) => {
    if (!window.confirm(`Revoke approval for "${name}"? They will no longer be able to claim food.`)) {
      return;
    }
    setActionUserId(userId);
    try {
      await api.patch(`/api/admin/recipients/${userId}/revoke`);
      setToastMessage(`Charity "${name}" approval revoked.`);
      setTimeout(() => setToastMessage(''), 4000);
      await fetchRecipients(activeTab);
    } catch {
      alert('Failed to revoke charity approval.');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
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
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 mb-1">
            <Link to="/admin/dashboard" className="hover:underline">Admin Dashboard</Link>
            <span>/</span>
            <span>Recipient Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Charity Verification Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Admin oversight and verification workflow for charitable organizations (FR-001.2)
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors self-start sm:self-auto"
        >
          <span>← Back to Operations</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 font-semibold transition-colors relative ${
            activeTab === 'pending'
              ? 'text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Approval
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 font-semibold transition-colors relative ${
            activeTab === 'approved'
              ? 'text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Approved Charities
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-semibold transition-colors relative ${
            activeTab === 'all'
              ? 'text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Recipients
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading recipient accounts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">{error}</div>
        ) : recipients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">No organizations found</p>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no recipients matching the &quot;{activeTab}&quot; filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Charity Organization</th>
                  <th className="px-6 py-3.5">Contact Number</th>
                  <th className="px-6 py-3.5">Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recipients.map((recip) => (
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
                    <td className="px-6 py-4">
                      {recip.isVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {!recip.isVerified ? (
                        <button
                          onClick={() => handleVerify(recip.userId, recip.name)}
                          disabled={actionUserId === recip.userId}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                        >
                          {actionUserId === recip.userId ? 'Processing...' : 'Approve'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevoke(recip.userId, recip.name)}
                          disabled={actionUserId === recip.userId}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold disabled:opacity-50 transition-colors"
                        >
                          {actionUserId === recip.userId ? 'Processing...' : 'Revoke'}
                        </button>
                      )}
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
