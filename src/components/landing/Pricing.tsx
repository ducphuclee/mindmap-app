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
    <section id="pricing" className="bg-gray-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
          Choose the plan that fits your needs. No hidden fees.
        </p>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-blue-600 bg-white shadow-xl ring-2 ring-blue-600"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-gray-600">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
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
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block rounded-lg px-6 py-3 text-center text-base font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
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
