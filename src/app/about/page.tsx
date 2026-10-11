import type { Metadata } from "next";
import { AboutRoll } from "@/components/AboutRoll";

export const metadata: Metadata = {
  title: "About",
  description: "Ali Chaaraoui — software and architecture, UNC Charlotte.",
};

export default function AboutPage() {
  return <AboutRoll />;
}
