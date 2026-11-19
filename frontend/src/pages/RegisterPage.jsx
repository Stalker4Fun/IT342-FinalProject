import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateClientSide = () => {
    const errors = {};

    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      errors.name = 'Name must be between 2 and 100 characters';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password || password.length < 8 || password.length > 72) {
      errors.password = 'Password must be between 8 and 72 characters';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one letter and one digit';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    const contactTrimmed = contactNumber.trim();
    if (!contactTrimmed) {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^09\d{9}$/.test(contactTrimmed) && !/^\+\d{10,15}$/.test(contactTrimmed)) {
      errors.contactNumber = 'Enter a valid Philippine number (09XXXXXXXXX) or international format (+ followed by 10-15 digits)';
    }

    if (!address || address.trim().length === 0) {
      errors.address = 'Physical address is required';
    } else if (address.length > 255) {
      errors.address = 'Address cannot exceed 255 characters';
    }

    const latProvided = latitude.trim() !== '';
    const lngProvided = longitude.trim() !== '';
    if ((latProvided && !lngProvided) || (!latProvided && lngProvided)) {
      errors.coordinates = 'Both latitude and longitude must be provided, or both left blank';
    } else if (latProvided && lngProvided) {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        errors.coordinates = 'Latitude must be between -90 and 90';
      } else if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        errors.coordinates = 'Longitude must be between -180 and 180';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);

    const payload = {
      role,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      latitude: latitude.trim() !== '' ? parseFloat(latitude) : null,
      longitude: longitude.trim() !== '' ? parseFloat(longitude) : null,
    };

    try {
      await api.post('/api/auth/register', payload);
      navigate('/login', {
        state: {
          registered: true,
          role,
        },
      });
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 409) {
          setGeneralError(data.message || 'An account with this email already exists.');
        } else if (status === 400 && data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          setGeneralError('Please correct the highlighted errors below.');
        } else if (data.message) {
          setGeneralError(data.message);
        } else {
          setGeneralError('Registration failed. Please check your entries.');
        }
      } else {
        setGeneralError('Unable to connect to the server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create an EcoBite Account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Join the surplus food rescue network in your community
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-2">
              <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection Cards */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('DONOR')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    role === 'DONOR'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-slate-900">Food Donor</span>
                    <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                      Immediate
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Restaurant, cafe, bakery, or grocery store sharing surplus food.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('RECIPIENT')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    role === 'RECIPIENT'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-slate-900">Charity / Recipient</span>
                    <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                      Needs Approval
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Charitable NGO, shelter, or community food bank claiming donations.
                  </p>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                {role === 'DONOR' ? 'Business Name' : 'Charity / Organization Name'}
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'DONOR' ? 'e.g. Sunrise Artisan Bakery' : 'e.g. Hope City Food Bank'}
                className={`mt-1 w-full px-3.5 py-2.5 rounded-xl border ${
                  fieldErrors.name ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-300'
                } shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Official Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@organization.org"
                className={`mt-1 w-full px-3.5 py-2.5 rounded-xl border ${
                  fieldErrors.email ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-300'
                } shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pass" className="block text-sm font-medium text-slate-700">
                  Password (min 8 chars)
                </label>
                <div className="mt-1 relative">
                  <input
                    id="pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 1 letter, 1 digit"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border ${
                      fieldErrors.password ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-300'
                    } shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPass" className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border ${
                      fieldErrors.confirmPassword ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-300'
                    } shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-slate-700">
                Contact Number
              </label>
              <input
                id="contact"
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                className={`mt-1 w-full px-3.5 py-2.5 rounded-xl border ${
                  fieldErrors.contactNumber ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-300'
                } shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all`}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Supports local Philippine format (09171234567) or international format (+639171234567).
              </p>
              {fieldErrors.contactNumber && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.contactNumber}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                Physical Pickup / Operating Address
              </label>
              <textarea
                id="address"
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Building, Street, Barangay, City, Province"
                className={`mt-1 w-full px-3.5 py-2.5 rounded-xl border ${
                  fieldErrors.address ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-300'
                } shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all`}
              />
              {fieldErrors.address && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.address}</p>
              )}
            </div>

            {/* Optional Coordinates */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Location Coordinates (Optional)
                </span>
                <span className="text-[11px] text-slate-400">For map routing in future increments</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Latitude (e.g. 10.3157)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Longitude (e.g. 123.8854)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              {fieldErrors.coordinates && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.coordinates}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                `Register as ${role === 'DONOR' ? 'Food Donor' : 'Charity Recipient'}`
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
