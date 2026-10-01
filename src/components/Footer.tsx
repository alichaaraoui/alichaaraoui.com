import { SoundToggle } from "./SoundToggle";

export function Footer() {
  return (
    <footer className="sitefooter shrink-0 text-[9px] uppercase tracking-[0.1em] text-neutral-400">
      <span>Ali Chaaraoui</span>
      <SoundToggle />
      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}
