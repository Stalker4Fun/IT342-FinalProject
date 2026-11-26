import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send a reset request right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-100 items-center justify-center text-emerald-700 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11c0-1.1.9-2 2-2s2 .9 2 2c0 .74-.4 1.38-1 1.73V14m-3 4h.01M7 9V7a5 5 0 0110 0v2m-11 0h12a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset your password</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Enter the email address associated with your EcoBite account.</p>
        </div>

        {submitted ? (
          <div className="mt-7 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1 text-emerald-800">If an account matches that address, we sent a single-use reset link. It expires in 15 minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">{error}</p>}
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all"
                placeholder="name@organization.com"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {loading ? 'Sending reset link...' : 'Email reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500"><Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Back to sign in</Link></p>
      </div>
    </div>
  );
};
