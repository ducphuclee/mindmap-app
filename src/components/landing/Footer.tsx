import Link from "next/link";

const links = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Documentation", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(214,235,253,0.19)] bg-black px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link
          href="/"
          className="font-heading text-xl text-[#f0f0f0]"
        >
          MindMap
        </Link>
        <nav className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-[#a1a4a5] transition-colors hover:text-[#f0f0f0]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-[#a1a4a5]">
          &copy; {new Date().getFullYear()} MindMap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
