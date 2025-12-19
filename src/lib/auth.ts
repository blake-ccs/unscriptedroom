export type User = { id: number; email: string; given_name?: string; family_name?: string };

export function isAuthed() {
  return !!localStorage.getItem("access_token");
}

export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function clearAuth() {
  localStorage.removeItem("access_token");
}
