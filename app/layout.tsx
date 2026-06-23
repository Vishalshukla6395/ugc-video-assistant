import type {Metadata} from "next";
import type {ReactNode} from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "UGC Video Assistant",
  description: "Chat with an AI assistant that turns product websites into short UGC videos."
};

export default function RootLayout({children}: Readonly<{children: ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
