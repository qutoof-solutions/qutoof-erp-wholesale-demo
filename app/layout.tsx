import type { Metadata } from "next";
import { BRAND_ASSETS } from "@/lib/brand";
import "./globals.css";
import { PwaRegister } from "@/components/public/pwa-register";
import { DataLocaleProvider } from "@/components/operations/data-portability-ui";
import { IntlProvider } from "@/components/providers/intl-provider";
import { localeDirection } from "@/lib/i18n/locale-cookie";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { ThemeScript } from "@/components/theme/theme-script";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "قطوف ERP - إدارة المخازن والجملة وشبكة المناديب",
  description: "عرض قطوف ERP التجريبي لإدارة المخازن والجملة ونقطة البيع والمندوبين والمشتريات.",
  applicationName: "قطوف ERP",
  manifest: "/manifest.webmanifest",
  icons: { icon: BRAND_ASSETS.mark.light, apple: BRAND_ASSETS.pwa.small },
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} dir={localeDirection(locale)} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <DataLocaleProvider initialLocale={locale}>
          <IntlProvider>{children}</IntlProvider>
        </DataLocaleProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
