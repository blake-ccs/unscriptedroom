export type User = { id: number; email: string; given_name?: string; family_name?: string };

export function isAuthed() {
  return !!localStorage.getItem("access_token");
}

export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function saveAuthEmail(email: string) {
  if (email) localStorage.setItem("auth_email", email);
}

export function getAuthEmail() {
  return localStorage.getItem("auth_email") || "";
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("auth_email");
}
