import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ThemeTweakerProvider } from "@/features/theme-tweaker/components/ThemeTweaker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Boilerplate",
  description: "Starter kit for building admin apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Warm up the Supabase client on the server so cookies are wired for RSC
  const supabase = getSupabaseServerClient();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ThemeTweakerProvider>
            {/* Conditionally render the app shell when authenticated so it persists across route transitions */}
            {/* Login page (unauthenticated) will render children only */}
            {/* This check runs on the server and avoids exposing auth client-side */}
            {/* eslint-disable-next-line @next/next/no-async-client-component */}
            {(() => {
              // This is synchronous because getUser reads cookies only
              // We don't await here; instead we rely on server environment
              // to avoid client exposure. We can safely use thenable here.
              // However Next doesn't allow top-level await in components; so we use a sync wrapper.
              return null;
            })()}
            {/* Fetch user in a Server Component boundary */}
            <AuthShell>{children}</AuthShell>
          </ThemeTweakerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Server Component: wraps children in app shell if authenticated
async function AuthShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <>{children}</>;
  }
  return (
    <div className="min-h-dvh grid grid-cols-1 md:grid-cols-[auto_1fr]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="min-w-0">
        <Header />
        {children}
      </div>
    </div>
  );
}
