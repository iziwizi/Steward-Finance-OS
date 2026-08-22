import type { ReactNode } from "react";

export const metadata = {
  title: "StewardOS — Administrator Portal",
  description: "Restricted platform administrator login for StewardOS Personal Finance OS.",
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
