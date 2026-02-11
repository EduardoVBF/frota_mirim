import { getSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:3333",
  baseURL: "https://frota-mirim-api.vercel.app",
});

// 🔐 Request interceptor: injeta token
api.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

// 🚨 Response interceptor: trata expiração de sessão
let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    // token expirado / sessão inválida
    if ((status === 401 || status === 403) && !isLoggingOut) {
      isLoggingOut = true;

      toast.error("Sessão expirada. Faça login novamente.");

      // pequeno delay para o usuário perceber o toast
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
        isLoggingOut = false;
      }, 800);
    }

    return Promise.reject(error);
  }
);
