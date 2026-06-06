import { cookies } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminTrackerClient } from "./tracker-client";
import { ADMIN_COOKIE_NAME, isAdminAuthConfigured, verifyAdminSessionToken } from "@/lib/admin-auth";

export default async function AdminTrackerPage() {
  const cookieStore = await cookies();
  const isAuthed = verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!isAuthed) {
    return <AdminLoginForm isConfigured={isAdminAuthConfigured()} />;
  }

  return (
    <>
      <AdminLogoutButton />
      <AdminTrackerClient />
    </>
  );
}
