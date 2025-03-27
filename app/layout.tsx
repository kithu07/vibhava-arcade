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

           <header className="py-4 px-6 border-b">
            <div className="container mx-auto flex justify-center">
              <Link href="/">
                <Image
                  src="/whitelogo.png" // Path to your logo in public folder
                  alt="Arcade Leaderboard"
                  width={180} // Adjust based on your logo dimensions
                  height={2} // Adjust based on your logo dimensions
                  className="hover:scale-105 transition-transform duration-200"
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
                  <span className="font-medium text-primary hover:text-primary/90 transition-colors duration-200">Keerthana</span>
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a 
                  href="https://portfolioashbin.vercel.app/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group flex items-center"
                >
                  <span className="font-medium text-primary hover:text-primary/90 transition-colors duration-200">Ashbin</span>
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a 
                  href="https://mishalfaisal.framer.website/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group flex items-center"
                >
                  <span className="font-medium text-primary hover:text-primary/90 transition-colors duration-200">Mishal</span>
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