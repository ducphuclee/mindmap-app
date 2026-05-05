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
    <section id="how-it-works" className="bg-black px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-heading text-center text-[56px] font-normal tracking-[-2.8px] text-[#f0f0f0]">
          How It Works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[#a1a4a5]">
          Get started in three simple steps.
        </p>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-[16px] border border-[rgba(214,235,253,0.19)] p-8"
            >
              <div className="inline-flex items-center justify-center rounded-[9999px] bg-[rgba(255,128,31,0.2)] px-4 py-1 text-sm font-medium text-[#ff801f]">
                Step {step.number}
              </div>
              <h3 className="mt-6 text-2xl font-medium text-[#f0f0f0]">
                {step.title}
              </h3>
              <p className="mt-2 text-base text-[#a1a4a5]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
