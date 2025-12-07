"use client";
import { Toaster as SonnerToaster } from "sonner";

export function NormalToaster() {
  return (
    <SonnerToaster
      position="top-center"
      theme="light"
      //closeButton
      offset="20px"
      duration={2000}
      expand={false}
      visibleToasts={1}
      richColors
      toastOptions={{
        style: {
          fontFamily: "inherit",
          marginTop: "20px",
        },
      }}
    />
  );
}
