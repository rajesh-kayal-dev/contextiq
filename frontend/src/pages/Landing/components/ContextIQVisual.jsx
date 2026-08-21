import React, { useEffect, useRef, useState } from "react";

/**
 * ContextIQVisual — Custom Canvas RAG Pipeline Visualization
 * Interactive, performant node graph visualizing the flow:
 * Documents → Chunking → Embeddings → Vector Search → Context → AI Answer
 */
export default function ContextIQVisual({ className = "" }) {
  const canvasRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: "Documents", desc: "PDF, DOCX, TXT, Web URLs", color: "#14B8A6" },
    { title: "Chunking", desc: "Smart text splitting", color: "#0F766E" },
    { title: "Embeddings", desc: "High-dimensional vectors", color: "#38BDF8" },
    {
      title: "Vector Search",
      desc: "LanceDB semantic query",
      color: "#2563EB",
    },
    { title: "Context", desc: "Relevant knowledge window", color: "#818CF8" },
    {
      title: "AI Answer",
      desc: "Grounded contextual response",
      color: "#34D399",
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.parentElement.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement.clientHeight || 500);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Node particle system setup
    const nodeCount = 28;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1.5,
      hue: i % 2 === 0 ? 174 : 199, // Teal / Cyan
    }));

    // Animated pulses flowing through the pipeline
    const pulses = [];
    let lastPulseTime = 0;

    let startTime = performance.now();

    const render = (now) => {
      if (prefersReducedMotion) {
        // Static background rendering for reduced motion
        ctx.fillStyle = "#0B1220";
        ctx.fillRect(0, 0, width, height);
        return;
      }

      ctx.fillStyle = "rgba(11, 18, 32, 0.25)";
      ctx.fillRect(0, 0, width, height);

      const elapsed = (now - startTime) * 0.001;

      // Cycle active step highlighting every 3.5s
      const stepIdx = Math.floor(elapsed / 3.5) % steps.length;
      setActiveStep(stepIdx);

      // Spawn data pulses along a curved path
      if (now - lastPulseTime > 1200) {
        pulses.push({
          progress: 0,
          speed: 0.008 + Math.random() * 0.004,
          step: Math.floor(Math.random() * (steps.length - 1)),
        });
        lastPulseTime = now;
      }

      // Draw faint connections between background nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(20, 184, 166, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update & draw background floating particles
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.hue === 174 ? "#14B8A6" : "#38BDF8";
        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Pipeline layout geometry
      const pipelineY = height * 0.5;
      const margin = Math.min(width * 0.1, 50);
      const availableW = width - margin * 2;
      const stepSpacing = availableW / (steps.length - 1);

      // Draw pipeline path line
      ctx.beginPath();
      ctx.moveTo(margin, pipelineY);
      for (let i = 0; i < steps.length; i++) {
        const x = margin + i * stepSpacing;
        const waveY = pipelineY + Math.sin(elapsed * 2 + i * 0.8) * 12;
        ctx.lineTo(x, waveY);
      }
      ctx.strokeStyle = "rgba(20, 184, 166, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update & draw flowing data pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const currentStep = Math.floor(pulse.progress * (steps.length - 1));
        const subProgress = (pulse.progress * (steps.length - 1)) % 1;
        const startX = margin + currentStep * stepSpacing;
        const endX = margin + (currentStep + 1) * stepSpacing;
        const startY =
          pipelineY + Math.sin(elapsed * 2 + currentStep * 0.8) * 12;
        const endY =
          pipelineY + Math.sin(elapsed * 2 + (currentStep + 1) * 0.8) * 12;

        const px = startX + (endX - startX) * subProgress;
        const py = startY + (endY - startY) * subProgress;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#38BDF8";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#38BDF8";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw main pipeline node keyframes
      steps.forEach((step, i) => {
        const x = margin + i * stepSpacing;
        const y = pipelineY + Math.sin(elapsed * 2 + i * 0.8) * 12;
        const isActive = i === stepIdx;

        // Glowing outer ring for active step
        if (isActive) {
          ctx.beginPath();
          ctx.arc(x, y, 18 + Math.sin(elapsed * 5) * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${step.color}22`;
          ctx.fill();
          ctx.strokeStyle = step.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Inner node dot
        ctx.beginPath();
        ctx.arc(x, y, isActive ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? step.color : "#475569";
        ctx.shadowBlur = isActive ? 15 : 0;
        ctx.shadowColor = step.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[400px] flex flex-col justify-between overflow-hidden bg-[#0B1220] rounded-2xl border border-slate-800/80 ${className}`}
    >
      {/* Background Interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Header Badge */}
      <div className="relative z-10 p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-teal-500/30 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="text-xs font-mono text-teal-300 uppercase tracking-wider">
            ContextIQ RAG Engine
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
          LanceDB + Vector Search
        </div>
      </div>

      {/* Step Info Overlay Cards */}
      <div className="relative z-10 p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pointer-events-auto">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          return (
            <div
              key={step.title}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                isActive
                  ? "bg-slate-900/90 border-teal-500/60 shadow-[0_0_15px_rgba(20,184,166,0.2)] scale-[1.02]"
                  : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  0{idx + 1}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
              </div>
              <h4
                className={`text-xs font-medium tracking-tight ${isActive ? "text-white font-semibold" : "text-slate-300"}`}
              >
                {step.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
