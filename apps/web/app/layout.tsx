import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAOS - Home Automation OS",
  description: "A modern home automation operating system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
