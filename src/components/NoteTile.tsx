import { plain, Typewriter } from "./Typewriter";
import type { Note } from "@/data/projects";

/** Roughly how long the line above takes to write, so the next one follows it. */
const LINE_SPEED = 28;
const LEAD_SPEED = 95;
const LEAD_IN = 260;

/** The statement, or one piece of it. Used by the desktop card and the
    phone landing alike. */
export function NoteBody({ note }: { note: Note }) {
  /* Each line waits for the one above it to finish writing. The lead never
     finishes — it loops — so the lines follow its first pass. */
  let at = note.lead ? LEAD_IN + plain(note.lead).length * LEAD_SPEED + 300 : 0;

  return (
    <div className="note-body">
      {note.lead && (
        <Typewriter
          className="note-lead"
          text={note.lead}
          loop
          speed={LEAD_SPEED}
          erase={40}
          hold={5000}
          delay={LEAD_IN}
        />
      )}
      {note.lines.map((line) => {
        const delay = at;
        at += plain(line).length * LINE_SPEED + 240;
        return (
          <Typewriter
            key={line}
            className="note-line"
            text={line}
            speed={LINE_SPEED}
            delay={delay}
          />
        );
      })}
    </div>
  );
}
