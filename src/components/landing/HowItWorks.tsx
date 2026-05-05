const steps = [
  {
    number: "1",
    title: "Create a Mind Map",
    description:
      "Start with a central idea and add branches. Use our intuitive editor to build your map in minutes.",
  },
  {
    number: "2",
    title: "Customize & Organize",
    description:
      "Rearrange nodes, change layouts, and apply colors to make your map clear and visually appealing.",
  },
  {
    number: "3",
    title: "Share or Export",
    description:
      "Collaborate with your team or export your map as PNG or PDF to use in presentations.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          How It Works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
          Get started in three simple steps.
        </p>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
