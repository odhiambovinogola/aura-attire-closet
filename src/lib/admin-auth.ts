import { supabase } from "./supabase";

export async function requireSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "/admin/login";
    return null;
  }
  return data.session;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/admin/login";
}
