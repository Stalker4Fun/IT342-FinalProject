import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const toFormState = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  contactNumber: user?.contactNumber || '',
  address: user?.address || '',
  latitude: user?.latitude ?? '',
  longitude: user?.longitude ?? '',
});

const getErrorMessage = (error, fallback) => {
  const fieldErrors = error.response?.data?.fieldErrors;
  if (fieldErrors) {
    return Object.values(fieldErrors)[0];
  }
  return error.response?.data?.message || fallback;
};

export const ProfilePage = () => {
  const { user, updateUser, clearSession } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => toFormState(user));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setProfile(toFormState(user));
  }, [user]);

  const updateProfileField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');

    const hasLatitude = String(profile.latitude).trim() !== '';
    const hasLongitude = String(profile.longitude).trim() !== '';
    if (hasLatitude !== hasLongitude) {
      setProfileError('Enter both latitude and longitude, or leave both blank.');
      return;
    }

    const payload = {
      ...profile,
      latitude: hasLatitude ? Number(profile.latitude) : null,
      longitude: hasLongitude ? Number(profile.longitude) : null,
    };

    setProfileSaving(true);
    try {
      const response = await api.put(`/api/users/${user.userId}`, payload);
      updateUser(response.data);
      setProfile(toFormState(response.data));
      setProfileMessage('Profile updated successfully.');
    } catch (requestError) {
      setProfileError(getErrorMessage(requestError, 'Unable to update your profile. Please try again.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordField = (event) => {
    const { name, value } = event.target;
    setPassword((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put('/api/auth/change-password', password);
      clearSession();
      navigate('/login', { replace: true, state: { passwordChanged: true } });
    } catch (requestError) {
      setPasswordError(getErrorMessage(requestError, 'Unable to change your password. Please try again.'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const roleLabel = user?.role === 'DONOR' ? 'Donor account' : user?.role === 'RECIPIENT' ? 'Recipient account' : 'Administrator account';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Account settings</span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your organization details and keep your account secure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs h-fit">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">{user?.name?.slice(0, 1).toUpperCase() || 'E'}</div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="mt-1 text-sm text-slate-500 break-all">{user?.email}</p>
          <span className="inline-flex mt-4 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{roleLabel}</span>
          {user?.role === 'RECIPIENT' && (
            <p className={`mt-4 text-xs leading-relaxed ${user.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
              {user.isVerified ? 'Your organization is approved to claim food.' : 'Your organization is awaiting administrator approval.'}
            </p>
          )}
        </aside>

        <section className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Organization details</h2>
                <p className="mt-1 text-xs text-slate-500">Your role and approval status are managed by the system and cannot be changed here.</p>
              </div>
            </div>

            {profileError && <p className="mt-5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">{profileError}</p>}
            {profileMessage && <p className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{profileMessage}</p>}

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700">Organization name</label>
                <input id="profile-name" name="name" required minLength="2" maxLength="100" value={profile.name} onChange={updateProfileField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" />
              </div>
              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700">Email address</label>
                <input id="profile-email" name="email" type="email" autoComplete="email" required maxLength="255" value={profile.email} onChange={updateProfileField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" />
              </div>
              <div>
                <label htmlFor="profile-contact" className="block text-sm font-medium text-slate-700">Contact number</label>
                <input id="profile-contact" name="contactNumber" required value={profile.contactNumber} onChange={updateProfileField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" />
              </div>
              <div>
                <label htmlFor="profile-address" className="block text-sm font-medium text-slate-700">Address</label>
                <input id="profile-address" name="address" required maxLength="255" value={profile.address} onChange={updateProfileField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" />
              </div>
              <div>
                <label htmlFor="profile-latitude" className="block text-sm font-medium text-slate-700">Latitude <span className="text-slate-400">(optional)</span></label>
                <input id="profile-latitude" name="latitude" type="number" step="any" min="-90" max="90" value={profile.latitude} onChange={updateProfileField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" />
              </div>
              <div>
                <label htmlFor="profile-longitude" className="block text-sm font-medium text-slate-700">Longitude <span className="text-slate-400">(optional)</span></label>
                <input id="profile-longitude" name="longitude" type="number" step="any" min="-180" max="180" value={profile.longitude} onChange={updateProfileField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end"><button type="submit" disabled={profileSaving} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">{profileSaving ? 'Saving profile...' : 'Save profile'}</button></div>
          </form>

          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="pb-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Change password</h2>
              <p className="mt-1 text-xs text-slate-500">Changing your password signs you out of every active EcoBite session.</p>
            </div>
            {passwordError && <p className="mt-5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">{passwordError}</p>}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2"><label htmlFor="current-password" className="block text-sm font-medium text-slate-700">Current password</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required value={password.currentPassword} onChange={handlePasswordField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" /></div>
              <div><label htmlFor="profile-new-password" className="block text-sm font-medium text-slate-700">New password</label><input id="profile-new-password" name="newPassword" type="password" autoComplete="new-password" required minLength="8" value={password.newPassword} onChange={handlePasswordField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" /></div>
              <div><label htmlFor="profile-confirm-password" className="block text-sm font-medium text-slate-700">Confirm new password</label><input id="profile-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength="8" value={password.confirmPassword} onChange={handlePasswordField} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none" /></div>
            </div>
            <div className="mt-6 flex justify-end"><button type="submit" disabled={passwordSaving} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 transition-colors">{passwordSaving ? 'Changing password...' : 'Change password'}</button></div>
          </form>
        </section>
      </div>
    </div>
  );
};
