import { authedFetch, asJson, type TokenGetter } from "./core";

export interface CurrentUser {
  user_id: string;
  full_name: string;
  email: string;
  role: "User" | "Admin";
  created_at: string;
}

export async function syncUser(
  getToken: TokenGetter,
  requestedRole?: string,
): Promise<{ status: string; message: string }> {
  const res = await authedFetch("/users/sync", getToken, {
    method: "POST",
    body: requestedRole ? JSON.stringify({ requested_role: requestedRole }) : undefined,
  });
  return asJson(res);
}

export async function fetchMe(getToken: TokenGetter): Promise<CurrentUser> {
  const res = await authedFetch("/users/me", getToken);
  return asJson<CurrentUser>(res);
}

export async function listUsers(getToken: TokenGetter): Promise<CurrentUser[]> {
  const res = await authedFetch("/users", getToken);
  return asJson<CurrentUser[]>(res);
}
