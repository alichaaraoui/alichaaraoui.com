import type { Metadata } from "next";
import { ArchiveBoard } from "@/components/ArchiveBoard";

export const metadata: Metadata = {
  title: "Archive",
  description: "Ideas, sketches and works by Ali Chaaraoui, all in one place.",
};

export default function ArchivePage() {
  return <ArchiveBoard />;
}
