export const environment = {
  production: true,
  googleClientId: '41479685552-umdbp9bijgp01jjsgoq7k10gfvsohgef.apps.googleusercontent.com',
  apiUrl: 'https://swoop-api.onrender.com/api',
  baseUrl: 'https://dj-rom.github.io/swoop-client-admin/',
};
// environments/environment.ts

// In auth interceptor, use environment variable
const API_URL = environment.apiUrl;
const SKIP_REFRESH_URLS = [`${API_URL}/auth/refresh`, `${API_URL}/auth/login`];
