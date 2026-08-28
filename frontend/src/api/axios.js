import axios from "axios";

// baseURL "/api" works with the Vite proxy in dev and can be pointed
// at a deployed backend URL via VITE_API_URL in production.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // send the httpOnly auth cookie
});

export default api;
