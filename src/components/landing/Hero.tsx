import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 md:py-32 text-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,_89,_0,_0.15)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="max-w-4xl font-display-serif text-[76.8px] md:text-[96px] font-normal leading-none tracking-[-0.96px] text-[#f0f0f0]">
          Map Your Ideas with{" "}
          AI-Powered{" "}
          Mind Maps
        </h1>
        <p className="mt-6 max-w-2xl font-display-sans text-[20px] leading-[1.30] text-[#a1a4a5]">
          Turn your thoughts into structured, visual mind maps in seconds.
          Collaborate, export, and share — all from your browser.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="bg-white text-black px-4 py-2 rounded-[9999px] text-sm font-medium"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] px-4 py-2 rounded-[9999px] text-sm font-medium hover:bg-[rgba(255,255,255,0.28)] transition-colors"
          >
            See Demo
          </a>
        </div>
      </div>
    </section>
  );
}
