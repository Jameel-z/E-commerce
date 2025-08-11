// src/components/ReduxProvider.tsx
"use client";

import { Provider } from "react-redux";
import { useRef } from "react";
import { makeStore, AppStore } from "@/lib/redux/store";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
