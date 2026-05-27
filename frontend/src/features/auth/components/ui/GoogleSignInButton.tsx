"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/shared/hooks/use-auth";
import { useToast } from "@/shared/hooks/use-toast";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export function GoogleSignInButton({
  onSuccess,
  text = "continue_with",
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google did not return a valid credential. Please try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast({ title: "Signed in with Google!", variant: "success" });
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className={`w-full flex justify-center transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Google sign-in was cancelled or failed.")}
          text={text}
          shape="rectangular"
          theme="outline"
          size="large"
          width="320"
          useOneTap={false}
        />
      </div>
    </div>
  );
}
