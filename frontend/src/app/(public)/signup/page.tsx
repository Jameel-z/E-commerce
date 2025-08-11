// src/app/(public)/signup/page.tsx
"use client";

import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Sign up for a new account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials 
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}