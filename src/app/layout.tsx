import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mcp-hunt — MCP Server Discovery",
  description: "The App Store for AI Agents · Discover, browse, and install MCP Servers",
  openGraph: {
    title: "mcp-hunt — MCP Server Discovery",
    description: "The App Store for AI Agents · Discover, browse, and install MCP Servers",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
