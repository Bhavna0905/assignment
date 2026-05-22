import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Zoom Clone",
  description: "Sign in to Zoom Clone with Google",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
