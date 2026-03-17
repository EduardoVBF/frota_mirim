import ConditionalLayout from "@/components/layout/conditionalLayout";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frota Mirim",
  description: "Gestão de frota inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="pt-BR">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </body>
      </html>
    </ReactQueryProvider>
  );
}