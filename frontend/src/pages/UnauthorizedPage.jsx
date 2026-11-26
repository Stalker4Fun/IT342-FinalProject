import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPathForRole } from '../config/navigation';

export const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    if (user) {
      navigate(getDashboardPathForRole(user.role), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v.01M12 9v2m9.364-1.364l-4.243-4.243A2 2 0 0015.707 5H8.293a2 2 0 00-1.414.586L2.636 9.828A2 2 0 002 11.243v5.514a2 2 0 00.586 1.414l4.243 4.243A2 2 0 008.293 23h7.414a2 2 0 001.414-.586l4.243-4.243A2 2 0 0022 16.757v-5.514a2 2 0 00-.586-1.414z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">403 - Access Denied</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          You don&apos;t have permission to access this resource. Your current role is{' '}
          <span className="font-semibold text-slate-800">{user?.role || 'Guest'}</span>.
        </p>
        <div className="mt-6">
          <button
            onClick={handleBackToDashboard}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            Return to My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
