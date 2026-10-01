import { Heading, Item, Panel } from "./Panel";

const experience = [
  { year: "2025—", role: "Software Developer", org: "Omvra Studios" },
  { year: "2024—", role: "Architecture + Software Intern", org: "Little Diversified" },
  { year: "2023—24", role: "Events Director", org: "AIAS Charlotte" },
  { year: "2022—23", role: "Creative Director & Developer", org: "Sublime MediSpa" },
];

const tools = [
  "TypeScript / React",
  "Python / FastAPI",
  "PostgreSQL",
  "Rhino / Grasshopper",
  "Blender",
  "Power Platform",
];

export function AboutPanel({ open }: { open: boolean }) {
  return (
    <Panel name="about" open={open}>
      <Item delay={0}>
        <p className="max-w-[46ch] text-[13px] leading-relaxed">
          I am reading Computer Science and Architecture at UNC Charlotte,
          finishing in 2027. Most of what I build sits where those two meet —
          generative geometry, tools that take a drawing problem and give it a
          loop to run in, and the interfaces people actually use afterwards.
          Looking for software and computational design work.
        </p>
      </Item>

      <div className="grid gap-x-8 gap-y-8 pt-8 md:grid-cols-[1fr_auto]">
        <Item delay={70}>
          <Heading>Experience</Heading>
          {experience.map((e) => (
            <div
              key={e.year}
              className="rule flex flex-col gap-1 py-2 text-[10px] leading-none sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="dim sm:w-20 sm:shrink-0">{e.year}</span>
              <span className="flex-1 uppercase tracking-[0.08em]">{e.role}</span>
              <span className="dim">{e.org}</span>
            </div>
          ))}
        </Item>

        <Item delay={140} className="md:w-44">
          <Heading>Tools</Heading>
          <ul className="dim space-y-1 text-[10px] leading-none">
            {tools.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="pt-6">
            <Heading>Education</Heading>
            <p className="dim text-[10px] leading-relaxed">
              UNC Charlotte
              <br />
              B.S. Computer Science
              <br />
              B.A. Architecture
              <br />
              2022—2027
            </p>
          </div>

          <div className="pt-6">
            <Heading>Résumé</Heading>
            <a
              href="/resume.pdf"
              className="text-[10px] underline underline-offset-4 hover:text-neutral-400"
            >
              Download PDF ↗
            </a>
          </div>
        </Item>
      </div>
    </Panel>
  );
}
