// src/app/(admin)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogOutButton";
import { getUserViaAPI } from "@/lib/auth";
import Link from "next/link";

// disable cache for admin pages
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  if (!token) {
    redirect("/login?error=no_token");
  }

  const user = await getUserViaAPI(token);
  if (!user) {
    redirect("/login?error=session_expired");
  }

  if (!user.is_admin) {
    redirect("/");
  }
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center text-black">
          <Link href="/dashboard" className="text-xl font-semibold">
            Admin Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Logged in as: {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
