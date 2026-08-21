import React from "react";

export default function Process() {
  const steps = [
    {
      step: "01",
      title: "INGEST",
      description: "Upload your documents and organize your knowledge.",
    },
    {
      step: "02",
      title: "RETRIEVE",
      description:
        "ContextIQ finds the most relevant information from your knowledge.",
    },
    {
      step: "03",
      title: "ANSWER",
      description:
        "Your selected AI model generates an answer using that context.",
    },
  ];

  return (
    <section
      id="process"
      className="relative z-10 w-full px-6 py-32 max-w-5xl mx-auto flex flex-col items-center"
    >
      <h2 className="text-3xl sm:text-5xl font-thin tracking-tight mb-20 text-neutral-100">
        How ContextIQ Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        {steps.map((item) => (
          <div
            key={item.step}
            className="p-8 rounded-[2rem] bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 transition-transform duration-500 hover:scale-[1.02]"
          >
            <div
              className="text-3xl text-neutral-600 mb-6 font-thin"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {item.step}
            </div>
            <h3 className="text-xl font-thin tracking-tight text-neutral-200 mb-4 uppercase">
              {item.title}
            </h3>
            <p className="text-sm font-extralight leading-[1.8] text-neutral-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
