// src/components/auth/SignUpForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/lib/redux/features/auth/authThunks";
import { AppDispatch, RootState } from "@/lib/redux/store";

interface SignUpFormProps {
  onSuccessRedirect?: string;
  className?: string;
}

export function SignUpForm({
  onSuccessRedirect = "/",
  className = "w-full max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-6",
}: SignUpFormProps) {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(registerUser({ email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      router.push(onSuccessRedirect);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <FormField
        label="email"
        id="email"
        type="text"
        value={email}
        onChange={(e) => setemail(e.target.value)}
        required
      />
      <FormField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <SubmitButton loading={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </SubmitButton>
    </form>
  );
}

// Sub-components for better reusability
interface FormFieldProps {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function FormField({
  label,
  id,
  type,
  value,
  onChange,
  required,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

interface SubmitButtonProps {
  children: React.ReactNode;
  loading: boolean;
}

function SubmitButton({ children, loading }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
