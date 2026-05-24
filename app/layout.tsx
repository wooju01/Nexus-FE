import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { DevNav } from "@/components/dev/dev-nav";

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
  title: "Nexus — Chat, tasks, and docs. Connected.",
  description:
    "팀의 대화·작업·문서를 하나로 연결하는 실시간 협업 대시보드. 10~200명 규모의 프로덕트·엔지니어링·디자인 팀을 위한 단일 홈.",
};

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-surface-base text-fg-primary">
        {children}
        <DevNav />
      </body>
    </html>
  );
}
