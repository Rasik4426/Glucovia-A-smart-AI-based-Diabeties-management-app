const BASE_URL = import.meta.env.VITE_BASE44_APP_BASE_URL;
const API_KEY = import.meta.env.VITE_BASE44_API_KEY;

export async function fetchGlucoseLogs() {
  const res = await fetch(`${BASE_URL}/entities/GlucoseLog`, {
    headers: {
      api_key: API_KEY
    }
  });
  return res.json();
}