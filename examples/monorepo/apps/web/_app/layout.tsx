import { Providers } from "@/components/providers";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { getTranslations, useLocale } from "next-globe-gen";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const generateMetadata = (): Metadata => {
  // Get translations for the "application" namespace
  // These keys are stored in the application message files
  const t = getTranslations("application");
  return {
    title: t("title", {
      _description: "Title of the web application",
      _defaultMessage: "Web Application",
    }),
    description: t("description", {
      _description: "Description of the web application",
      _defaultMessage: "Web Application Description",
    }),
  };
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = useLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
