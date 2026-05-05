const features = [
  {
    title: "Intuitive Editor",
    description:
      "Drag, drop, and connect nodes with a clean, distraction-free interface. Create mind maps in minutes.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
        />
      </svg>
    ),
  },
  {
    title: "Multiple Layouts",
    description:
      "Switch between tree, radial, and freeform layouts to find the structure that works best for your ideas.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
        />
      </svg>
    ),
  },
  {
    title: "Real-time Save",
    description:
      "Every change you make is saved automatically. Never lose your work, even if you close the tab.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
    ),
  },
  {
    title: "Export PNG / PDF",
    description:
      "Download your mind maps as high-resolution PNG images or PDF documents for presentations and sharing.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    ),
  },
  {
    title: "Share Links",
    description:
      "Generate shareable links for any mind map. Collaborate with your team in real time.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
        />
      </svg>
    ),
  },
  {
    title: "Team-friendly",
    description:
      "Invite teammates to view and edit mind maps. Built for collaboration from the ground up.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
  },
];

const accentColors = [
  { bg: "rgba(255,128,31,0.15)", text: "#ff801f" },
  { bg: "rgba(17,255,153,0.15)", text: "#11ff99" },
  { bg: "rgba(59,158,255,0.15)", text: "#3b9eff" },
];

export default function Features() {
  return (
    <section id="features" className="bg-black px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-heading text-center text-[56px] font-normal tracking-[-2.8px] text-[#f0f0f0]">
          Everything You Need to Mind Map
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[#a1a4a5]">
          Powerful features designed to help you capture, organize, and share
          your ideas effortlessly.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const accent = accentColors[i % accentColors.length];
            return (
              <div
                key={feature.title}
                className="rounded-[16px] border border-[rgba(214,235,253,0.19)] bg-transparent p-6 shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px]"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: accent.bg, color: accent.text }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-medium text-[#f0f0f0]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base text-[#a1a4a5]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
