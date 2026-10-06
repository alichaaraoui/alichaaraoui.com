import type { Metadata } from "next";
import Image from "next/image";
import sheet from "../../../public/resume.png";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Ali Chaaraoui — résumé.",
};

const FILE = "/resume.pdf";

/**
 * The sheet itself, and a link to take it away. Nothing else.
 *
 * It is a picture of the page rather than an embedded PDF because every
 * browser wraps an embedded one in its own reader — a toolbar, a thumbnail
 * rail, a zoom box — and none of that is the résumé.
 */
export default function ResumePage() {
  return (
    <main className="resume-page">
      <Image className="resume-sheet" src={sheet} alt="Résumé" priority />
      <a className="resume-get" href={FILE} download>
        Download PDF ↓
      </a>
    </main>
  );
}
