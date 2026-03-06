import "./globals.css";

export const metadata = {
  title: "ALOSMusic",
  description: "Zambia Gospel Music Streaming Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}