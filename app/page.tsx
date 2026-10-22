import type { Metadata } from "next";
import { ErpDemoApp } from "@/components/erp-demo/erp-demo-app";

export const metadata: Metadata = {
  title: "قطوف ERP - إدارة المخازن والجملة وشبكة المناديب",
  description: "عرض تجريبي محلي لإدارة المخازن والجملة ونقطة البيع والمندوبين والمشتريات.",
  applicationName: "قطوف ERP",
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return <ErpDemoApp />;
}
