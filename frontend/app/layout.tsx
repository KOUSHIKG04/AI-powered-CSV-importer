import { Providers } from "@/app/providers"
import "./globals.css"

// @wrksz/themes = useServerInsertedHTML + useSyncExternalStore + SSR-safe storage.
// It uses useServerInsertedHTML to inject theme setup during SSR before hydration,
// and useSyncExternalStore to keep theme state in sync from an external store safely in React
import { ThemeProvider } from "@wrksz/themes/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="font-sans antialiased"
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
