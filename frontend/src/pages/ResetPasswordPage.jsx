import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/reset-password', { token, newPassword, confirmPassword });
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset the password. Request a new reset link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">Choose a new password</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Use at least eight characters, including a letter and a number.</p>

        {!token ? (
          <div className="mt-7 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
            This reset link is incomplete. Request a new password-reset email to continue.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">{error}</p>}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" required minLength="8" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm new password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">{loading ? 'Resetting password...' : 'Reset password'}</button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500"><Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Back to sign in</Link></p>
      </div>
    </div>
  );
};
