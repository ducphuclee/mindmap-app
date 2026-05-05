import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[rgba(214,235,253,0.19)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-white font-display-sans text-lg font-medium">
          MindMap
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="font-display-sans text-sm font-medium tracking-[0.35px] text-[#a1a4a5] hover:text-[#f0f0f0] transition-colors">
            Features
          </Link>
          <Link href="/api" className="font-display-sans text-sm font-medium tracking-[0.35px] text-[#a1a4a5] hover:text-[#f0f0f0] transition-colors">
            API
          </Link>
          <Link href="/docs" className="font-display-sans text-sm font-medium tracking-[0.35px] text-[#a1a4a5] hover:text-[#f0f0f0] transition-colors">
            Docs
          </Link>
          <Link href="/changelog" className="font-display-sans text-sm font-medium tracking-[0.35px] text-[#a1a4a5] hover:text-[#f0f0f0] transition-colors">
            Changelog
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] px-4 py-2 rounded-[9999px] text-sm font-medium hover:bg-[rgba(255,255,255,0.28)] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-black px-4 py-2 rounded-[9999px] text-sm font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
