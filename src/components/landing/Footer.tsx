import Link from "next/link";

const links = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Documentation", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="text-xl font-bold text-violet-600">
          MindMap
        </Link>
        <nav className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MindMap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
