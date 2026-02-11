import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Heart, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arcade Leaderboard",
  description: "Track your scores and compete in the arcade",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >

          <header className="py-4 px-6 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between sm:justify-center gap-8">
              <Link href="/" className="flex items-center">
                <Image
                  src="/whitelogo.png"
                  alt="Vibhava Arcade"
                  width={150}
                  height={50}
                  className="h-12 w-auto hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300"
                  priority
                />
              </Link>
              <div className="h-8 w-[1px] bg-white/20 hidden sm:block"></div>
              <Link href="/" className="flex items-center">
                <Image
                  src="/tinkerhub-soe-cusat.png"
                  alt="TinkerHub SOE CUSAT"
                  width={150}
                  height={50}
                  className="h-12 w-auto hover:drop-shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all duration-300"
                  priority
                />
              </Link>
            </div>
          </header>

          <main className="min-h-[calc(100vh-40px)]">
            {children}
          </main>

          {/* Creative Footer with Credits */}
          <footer className="w-full py-2 text-center relative overflow-hidden bg-black/30 backdrop-blur-sm border-t border-primary/10">
            <div className="px-4 container mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-sm text-muted-foreground">
              <span className="opacity-80">Made with</span>
              <Heart className="h-4 w-4 fill-green-500 text-green-500 animate-pulse" />
              <span className="opacity-80">by</span>
              <div className="flex flex-wrap justify-center gap-x-3">
                <a
                  href="https://keerthana-portfolio-mu.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group flex items-center"
                >
                  <span className="font-medium text-primary hover:text-primary/90 transition-colors duration-200">Keerthanaaa</span>
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}