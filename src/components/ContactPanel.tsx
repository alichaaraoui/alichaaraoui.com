import { Panel } from "./Panel";

const links = [
  {
    label: "Email",
    value: "a.chaaraoui@icloud.com",
    href: "mailto:a.chaaraoui@icloud.com",
  },
  {
    label: "GitHub",
    value: "github.com/alichaaraoui",
    href: "https://github.com/alichaaraoui",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/alichaaraoui",
    href: "https://linkedin.com/in/alichaaraoui",
  },
];

export function ContactPanel({ open }: { open: boolean }) {
  return (
    <Panel name="contact" open={open}>
      <ul>
        {links.map((l, i) => {
          const external = l.href.startsWith("http");
          return (
            <li
              key={l.label}
              className="panel-item rule"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <a
                href={l.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="flex items-baseline gap-4 py-2.5 text-[10px] leading-none hover:opacity-70"
              >
                <span className="dim w-16 shrink-0 uppercase tracking-[0.11em]">
                  *{l.label}
                </span>
                <span className="flex-1">{l.value}</span>
                <span className="dim">↗</span>
              </a>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
