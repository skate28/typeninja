import { GitBranchIcon, PaletteIcon } from "./Icons";

const footerLinks = [
  { label: "about", href: "#" },
  { label: "leaderboard", href: "#" },
  { label: "github", href: "#" },
  { label: "discord", href: "#" },
  { label: "privacy", href: "#" },
];

export function Footer() {
  return (
    <footer className="mt-auto px-8 py-6 max-w-[1600px] mx-auto w-full border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sub text-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <PaletteIcon />
            shadow dojo
          </span>
          <span className="flex items-center gap-1">
            <GitBranchIcon />
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}
