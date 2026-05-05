import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started with mind mapping.",
    features: [
      "Up to 3 mind maps",
      "Basic layouts",
      "Export as PNG",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    description: "For power users who need unlimited creativity.",
    features: [
      "Unlimited mind maps",
      "All layouts (tree, radial, freeform)",
      "Export as PNG & PDF",
      "Shareable links",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "/signup",
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-black px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-heading text-center text-[56px] font-normal tracking-[-2.8px] text-[#f0f0f0]">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[#a1a4a5]">
          Choose the plan that fits your needs. No hidden fees.
        </p>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[16px] border bg-transparent p-8 ${
                plan.highlighted
                  ? "border-[#ff801f]/40 shadow-[0_0_24px_rgba(255,128,31,0.1)]"
                  : "border-[rgba(214,235,253,0.19)]"
              }`}
            >
              <h3 className="text-2xl font-medium text-[#f0f0f0]">
                {plan.name}
              </h3>
              <p className="mt-1 text-base text-[#a1a4a5]">
                {plan.description}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-[#f0f0f0]">
                  {plan.price}
                </span>
                <span className="text-[#a1a4a5]">/month</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#11ff99]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    <span className="text-[#a1a4a5]">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block rounded-[9999px] px-6 py-3 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-white/90"
                    : "border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.28)]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
