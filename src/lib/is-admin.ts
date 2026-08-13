/**
 * Admin check performed by reading the caller's own role row.
 *
 * RLS on `user_roles` only exposes rows where `user_id = auth.uid()`, so this
 * can never reveal another account's roles. The privileged `has_role` helper
 * lives in a non-exposed schema and is used by RLS policies only.
 */
export async function checkIsAdmin(
  client: { from: (table: "user_roles") => any },
  userId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}
