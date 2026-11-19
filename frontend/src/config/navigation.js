export const ROLE_NAVIGATION = {
  DONOR: [
    { label: 'Dashboard', path: '/donor/dashboard', disabled: false },
    { label: 'My Listings', path: null, disabled: true, badge: 'Soon' },
    { label: 'Create Listing', path: null, disabled: true, badge: 'Soon' },
  ],
  RECIPIENT: [
    { label: 'Dashboard', path: '/recipient/dashboard', disabled: false },
    { label: 'Browse Listings', path: null, disabled: true, badge: 'Soon' },
    { label: 'My Claims', path: null, disabled: true, badge: 'Soon' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', disabled: false },
    { label: 'Verify Recipients', path: '/admin/recipients', disabled: false },
  ],
};

export const getDashboardPathForRole = (role) => {
  switch (role) {
    case 'DONOR':
      return '/donor/dashboard';
    case 'RECIPIENT':
      return '/recipient/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};
