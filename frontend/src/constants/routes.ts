// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    BARBERS: '/dashboard/barbers',
    TRANSACTIONS: '/dashboard/transactions',
    SALARY: '/dashboard/salary',
    SETTINGS: '/dashboard/settings',
  },
} as const;