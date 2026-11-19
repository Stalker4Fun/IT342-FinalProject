import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const RecipientDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/recipient/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      setError('Failed to load recipient dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await fetchDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading recipient profile...</p>
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

  const profile = dashboardData?.user || user;
  const isVerified = dashboardData?.isVerified ?? profile?.isVerified ?? false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Verification Status Banner (FR-001.2) */}
      {!isVerified ? (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-amber-900">
                  Awaiting Admin Approval (FR-001.2)
                </h2>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  Awaiting admin approval. You can't claim food until your account is approved.
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Our system administrator must verify your charity credentials before surplus food claiming is enabled.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5"
            >
              {refreshing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-amber-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Check Status</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-6 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-900">
                Account Approved & Verified
              </h2>
              <p className="text-sm text-emerald-800 mt-0.5">
                Your charitable organization is approved. You will have full food claim privileges in Increment 2.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Charity Organization Profile</h2>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isVerified ? 'Approved Charity' : 'Pending Verification'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Organization Name
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{profile?.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Email
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{profile?.email}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contact Number
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{profile?.contactNumber}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Claiming Status
              </p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  isVerified ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isVerified ? 'ELIGIBLE TO CLAIM' : 'CLAIMING DISABLED (Awaiting Verification)'}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Registered Charity Address
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{profile?.address}</p>
            </div>
          </div>
        </div>

        {/* Future Modules */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Claiming Features</h3>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-slate-400 cursor-not-allowed">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Browse Available Listings</span>
                </div>
                <span className="text-[11px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                  Increment 2
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-slate-400 cursor-not-allowed">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">My Claimed Food</span>
                </div>
                <span className="text-[11px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                  Increment 2
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              About Admin Verification
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with SRS specification FR-001.2, recipient accounts must undergo administrator validation to ensure food safety compliance and legitimate charitable distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
