// src/app/page.tsx
import Link from "next/link";

export const revalidate = 3600; // ISR: Regenerate every hour

export default function Home() {
  return (
    <main className="min-h-screen">
      <Link href={"/dashboard"} className="text-blue-500 hover:underline">
        Go to Dashboard
      </Link>
      <Link href={"/login"}> Go to login</Link>
      <Link href={"/signup"}> Go to signup</Link>
    </main>
  );
}
