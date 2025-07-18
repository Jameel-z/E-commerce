// src/components/auth/AuthInitializer.tsx
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "@/lib/redux/features/auth/authThunks";
import { AppDispatch } from "@/lib/redux/store";

export default function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return null;
}
