import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/donor/dashboard');
        setDashboardData(res.data);
      } catch (err) {
        setError('Failed to load donor dashboard from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading donor profile...</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full mb-3">
            Donor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {dashboardData?.message || `Welcome, ${profile?.name}!`}
          </h1>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Your food establishment is active in the rescue network. When you post surplus edible food, local verified charities receive immediate notification for pickup.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Establishment Profile</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Donor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Business Name
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{profile?.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account Email
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
                Account Status
              </p>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-emerald-700">
                  {dashboardData?.accountStatus || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Registered Pickup Address
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{profile?.address}</p>
            </div>

            {(profile?.latitude != null || profile?.longitude != null) && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Coordinates
                </p>
                <p className="text-xs font-mono text-slate-600 mt-1">
                  Lat: {profile?.latitude ?? 'N/A'}, Lng: {profile?.longitude ?? 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel & Next Increments Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-slate-400 cursor-not-allowed">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Create Food Listing</span>
                </div>
                <span className="text-[11px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                  Increment 2
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-slate-400 cursor-not-allowed">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Manage Listings</span>
                </div>
                <span className="text-[11px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                  Increment 2
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-200/60 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              Rescue Network Readiness
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your profile is authenticated and active. When food listing features roll out in Increment 2, your establishment will be immediately ready to post surplus perishable items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
