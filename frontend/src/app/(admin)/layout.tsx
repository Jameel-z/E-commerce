import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify authentication
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm text-black">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 text-black">{children}</main>
    </div>
  );
}

