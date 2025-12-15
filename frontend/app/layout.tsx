import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Scientist Ecosystem - Disaster Monitoring Dashboard",
  description: "Real-time monitoring of space weather, earthquakes, and natural disasters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-gray-100">
        <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">🛡️ AI Scientist Ecosystem</h1>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="/" className="hover:text-white transition-colors">Dashboard</a>
                <a href="/alerts" className="hover:text-white transition-colors">Alerts</a>
                <a href="/earthquakes" className="hover:text-white transition-colors">Earthquakes</a>
                <a href="/water-levels" className="hover:text-white transition-colors">Water Levels</a>
                <a href="/space-weather" className="hover:text-white transition-colors">Space Weather</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
