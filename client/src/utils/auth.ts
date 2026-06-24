import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import Cookies from "js-cookie";

const API_BASE = "http://localhost:5000/auth"; // Hardcoded for simplicity since backend runs on 3000

export const getToken = () => Cookies.get("access_token");
export const setToken = (token: string) =>
  Cookies.set("access_token", token, { expires: 1 });
export const removeToken = () => Cookies.remove("access_token");

export const registerAndStorePasskey = async (email: string) => {
  // 1. Get options
  const optionsRes = await fetch(`${API_BASE}/register-options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!optionsRes.ok) throw new Error("Failed to get registration options");
  const options = await optionsRes.json();

  // 2. Start browser WebAuthn
  const attResp = await startRegistration(options);

  // 3. Verify
  const verifyRes = await fetch(`${API_BASE}/register-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, ...attResp }),
  });
  if (!verifyRes.ok) throw new Error("Failed to verify registration");
  const result = await verifyRes.json();

  if (result.verified && result.access_token) {
    setToken(result.access_token);
    return true;
  }
  return false;
};

export const loginWithPasskey = async (email: string) => {
  // 1. Get options
  const optionsRes = await fetch(`${API_BASE}/login-options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!optionsRes.ok) throw new Error("Failed to get login options");
  const options = await optionsRes.json();

  // 2. Start browser WebAuthn
  const asseResp = await startAuthentication(options);

  // 3. Verify
  const verifyRes = await fetch(`${API_BASE}/login-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asseResp),
  });
  if (!verifyRes.ok) throw new Error("Failed to verify authentication");
  const result = await verifyRes.json();

  if (result.verified && result.access_token) {
    setToken(result.access_token);
    return true;
  }
  return false;
};
