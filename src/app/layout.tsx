import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/presentation/components/organisms/Providers";

export const metadata: Metadata = {
  title: "Sistem Informasi Lalu Lintas",
  description: "Aplikasi Manajemen Data Lalu Lintas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
