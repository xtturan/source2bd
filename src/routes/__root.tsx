import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/s2b/header";
import { Footer } from "@/components/s2b/footer";
import { MobileDock } from "@/components/s2b/mobile-dock";
import { LanguageProvider } from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-24">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">পেজটি পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          এই পেজটি নেই বা সরানো হয়েছে। হোম পেজে ফিরে যান, অথবা WhatsApp-এ মেসেজ দিন।
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600"
          >
            হোমে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Source2BD, source from anywhere and land it in Bangladesh" },
      {
        name: "description",
        content:
          "Source2BD sources from 1688, Alibaba and Amazon, then ships to Dhaka and Chattogram by air, sea, courier or hand carry. Same-day WhatsApp quotes.",
      },
      { name: "author", content: "Source2BD" },
      { name: "theme-color", content: "#0b1c2c" },
      { name: "application-name", content: "Source2BD" },
      { name: "apple-mobile-web-app-title", content: "Source2BD" },
      { property: "og:site_name", content: "Source2BD" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Source2BD, source from anywhere and land it in Bangladesh" },
      { name: "twitter:title", content: "Source2BD, source from anywhere and land it in Bangladesh" },
      { property: "og:description", content: "Source2BD sources from 1688, Alibaba, Amazon and any global store, then moves it to Dhaka and Chattogram by air, sea, courier or hand carry. WhatsApp quotes same day." },
      { name: "twitter:description", content: "Source2BD sources from 1688, Alibaba, Amazon and any global store, then moves it to Dhaka and Chattogram by air, sea, courier or hand carry. WhatsApp quotes same day." },
      { property: "og:image", content: "https://source2bd.com/og-cover.jpg" },
      { name: "twitter:image", content: "https://source2bd.com/og-cover.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;500;600&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Source2BD",
          alternateName: "TWT International",
          url: "https://source2bd.com",
          logo: "https://source2bd.com/apple-touch-icon.png",
          parentOrganization: { "@type": "Organization", name: "TWT International" },
          telephone: "+8801752457930",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Chawkbazar",
            addressLocality: "Dhaka",
            addressCountry: "BD",
          },
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+8801752457930",
              contactType: "customer service",
              availableLanguage: ["bn", "en"],
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Source2BD",
          parentOrganization: { "@type": "Organization", name: "TWT International" },
          description:
            "Global sourcing agent and Bangladesh cargo: 1688, Alibaba, Amazon and worldwide stores, delivered to Dhaka and Chattogram.",
          telephone: "+8801752457930",
          url: "https://source2bd.com",
          priceRange: "৳৳",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Chawkbazar",
            addressLocality: "Dhaka",
            addressCountry: "BD",
          },
          areaServed: ["Bangladesh", "China", "United States"],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
              opens: "10:00",
              closes: "20:00",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Source2BD",
          url: "https://source2bd.com",
          inLanguage: "bn-BD",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://source2bd.com/sourcing?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <Footer />
          <MobileDock />
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
