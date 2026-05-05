import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
        Map Your Ideas with{" "}
        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          AI-Powered
        </span>{" "}
        Mind Maps
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
        Turn your thoughts into structured, visual mind maps in seconds.
        Collaborate, export, and share — all from your browser.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          Get Started Free
        </Link>
        <a
          href="#features"
          className="rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          See Demo
        </a>
      </div>
    </section>
  );
}
