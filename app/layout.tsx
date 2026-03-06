import "./globals.css";

export const metadata = {
  title: "ALOSMusic",
  description: "Zambia Gospel Music Streaming Platform",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
};

export const viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>

      <body className="bg-black text-white">{children}</body>
    </html>
  );
}