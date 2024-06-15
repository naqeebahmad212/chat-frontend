import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MessageContextProvider } from "@/context/Message";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digichat",
  description: "chat with friends and family",
  icons: {
    icon: "../assets/chat.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MessageContextProvider>
          <main>
            {children}
            {/* <MobileNav /> */}
          </main>
        </MessageContextProvider>
      </body>
    </html>
  );
}
