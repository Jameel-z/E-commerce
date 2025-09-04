import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "@/lib/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a display-friendly name for a user
 * Fallback order: user.name -> email prefix -> "User"
 */
export function getDisplayName(user: User): string {
  if (user.name) return user.name;
  if (user.email) return user.email.split("@")[0];
  return "User";
}

/**
 * Get user initials for avatars
 */
export function getUserInitials(user: User): string {
  const displayName = getDisplayName(user);
  return displayName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  return user?.is_admin ?? false;
}
