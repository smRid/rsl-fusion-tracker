import { cookies } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { UploadCalendar } from "@/components/upload/UploadCalendar";
import { ADMIN_COOKIE_NAME, isAdminAuthConfigured, verifyAdminSessionToken } from "@/lib/admin-auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!isAuthed) {
    return <AdminLoginForm isConfigured={isAdminAuthConfigured()} />;
  }

  return (
    <>
      <AdminLogoutButton />
      <UploadCalendar
        trackerPath="/admin/tracker"
        eyebrow="Fusion Calendar Admin"
        title="Admin Fusion Tracker"
        subtitle="Upload, load, and manage fusion calendar trackers from the protected admin area."
        showTrackerActions
      />
    </>
  );
}
