"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

// ---------------------------------------------------------------
// Content — order carries real meaning here, so steps are numbered.
// ---------------------------------------------------------------
type Step = {
  n: string;
  title: string;
  copy: string;
  emoji: string;
  color: string; // vivid accent for this station's glow, marker & label
};

const steps: Step[] = [
  {
    n: "01",
    title: "Raw Material Sourcing",
    copy: "Premium-grade LDPE and polyethylene resins, selected for superior clarity, strength and seal performance.",
    emoji: "🧪",
    color: "#FF6B6B",
  },
  {
    n: "02",
    title: "Co-Extrusion",
    copy: "3-layer co-extrusion on Ashoka Industries, Windsor and Rajoo Engineers lines for consistent film structure.",
    emoji: "⚙️",
    color: "#FFB020",
  },
  {
    n: "03",
    title: "Custom Printing",
    copy: "3-colour printing and lamination on Mohindra Engineering machines for brand-accurate, edge-to-edge results.",
    emoji: "🖨️",
    color: "#2DD4BF",
  },
  {
    n: "04",
    title: "Cutting & Sealing",
    copy: "Bottom-seal machines up to 55\" (max 50×80\") from Yadav Machinery, cut and sealed to precise dimensions.",
    emoji: "✂️",
    color: "#8B7CF6",
  },
  {
    n: "05",
    title: "Quality Inspection",
    copy: "Stringent in-process and final checks on seal strength, print registration and thickness before release.",
    emoji: "🔍",
    color: "#FF4D8D",
  },
  {
    n: "06",
    title: "Packing & Dispatch",
    copy: "Unique barcode labelling and efficient dispatch, tracked from our floor to every corner of India.",
    emoji: "📦",
    color: "#22C55E",
  },
];

// ---------------------------------------------------------------
// Geometry — one vertical "lane" per step, path zig-zags between
// a left waypoint and a right waypoint, S-curved like a conveyor.
// ---------------------------------------------------------------
const STEP_H = 300; // px of vertical space per station
const VB_W = 1000; // svg viewBox width (unitless, auto-scales)
const LEFT_X = 330;
const RIGHT_X = 670;

function buildPath(points: { x: number; y: number }[]) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function ManufacturingProcess() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  const [pathLength, setPathLength] = useState(0);
  const trackHeight = STEP_H * steps.length;

  const waypoints = useMemo(
    () =>
      steps.map((_, i) => ({
        x: i % 2 === 0 ? LEFT_X : RIGHT_X,
        y: STEP_H * i + STEP_H / 2,
      })),
    []
  );
  const pathD = useMemo(() => buildPath(waypoints), [waypoints]);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [pathD]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start center", "end center"],
  });

  // Solid "traveled" portion of the line grows with scroll progress.
  const dashOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [pathLength, 0]
  );

  // Pouch position + tilt, driven imperatively from getPointAtLength
  // so it tracks the exact curve rather than a linear approximation.
  const pouchX = useMotionValue(waypoints[0]?.x ?? 0);
  const pouchY = useMotionValue(waypoints[0]?.y ?? 0);
  const pouchTilt = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const path = pathRef.current;
    if (!path || !pathLength) return;
    const clamped = Math.min(Math.max(latest, 0), 1);
    const dist = clamped * pathLength;
    const p0 = path.getPointAtLength(dist);
    const p1 = path.getPointAtLength(Math.min(dist + 1, pathLength));
    pouchX.set(p0.x);
    pouchY.set(p0.y);
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI);
    // Subtle tilt only — a pouch shouldn't roll fully sideways.
    pouchTilt.set(Math.max(-22, Math.min(22, angle * 0.35)));
  });

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative overflow-hidden bg-[#0B1730] py-24 sm:py-32"
    >
      {/* ambient backdrop texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #B7C0CC 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* soft colourful glows, one per station colour, drifting in the background */}
      <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl">
        {steps.map((s, i) => (
          <div
            key={i}
            className="absolute h-72 w-72 rounded-full"
            style={{
              backgroundColor: s.color,
              opacity: 0.16,
              left: i % 2 === 0 ? "0%" : "60%",
              top: `${(i / steps.length) * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-[#4C5FE0]/40 bg-[#4C5FE0]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9AA6F5]">
            How We Make It
          </span>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Our <em className="not-italic text-[#4C5FE0]">Manufacturing</em>{" "}
            Process
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#B7C0CC] sm:text-lg">
            From raw resin to a sealed, labelled pouch on a truck — six
            stages, one continuous line.
          </p>
        </div>

        {/* ---------------- Track: path + pouch + step cards ---------------- */}
        <div
          ref={trackRef}
          className="relative mt-20"
          style={{ height: trackHeight }}
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VB_W} ${trackHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="routeGradient" x1="0" y1="0" x2="0" y2="1">
                {steps.map((s, i) => (
                  <stop
                    key={i}
                    offset={`${(i / (steps.length - 1)) * 100}%`}
                    stopColor={s.color}
                  />
                ))}
              </linearGradient>
              <radialGradient id="pouchGradient" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#FFD93D" />
                <stop offset="45%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </radialGradient>
            </defs>

            {/* full route, always visible, faint */}
            <path
              d={pathD}
              fill="none"
              stroke="#B7C0CC"
              strokeOpacity={0.28}
              strokeWidth={4}
              strokeDasharray="2 14"
              strokeLinecap="round"
            />
            {/* traveled route, fills in with scroll — full rainbow gradient */}
            <motion.path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeDasharray={pathLength || 1}
              style={{ strokeDashoffset: dashOffset }}
            />

            {/* station markers, glowing in each step's own colour */}
            {waypoints.map((wp, i) => (
              <g key={i}>
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r={16}
                  fill={steps[i].color}
                  opacity={0.18}
                />
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r={9}
                  fill="#0B1730"
                  stroke={steps[i].color}
                  strokeWidth={2.5}
                />
              </g>
            ))}

            {/* the traveling pouch — big, bright, hard to miss */}
            <motion.g style={{ x: pouchX, y: pouchY, rotate: pouchTilt }}>
              <motion.g
                animate={
                  prefersReducedMotion ? undefined : { y: [0, -7, 0] }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* soft colour glow behind the pouch */}
                <circle cx={0} cy={0} r={30} fill="#8B5CF6" opacity={0.28} />
                {/* drop shadow */}
                <ellipse cx={0} cy={30} rx={20} ry={5} fill="#000000" opacity={0.3} />
                {/* stand-up pouch silhouette, bigger, gradient-filled */}
                <path
                  d="M-19 10c0-16 5-25 19-25s19 9 19 25v10a9 9 0 0 1-9 9h-20a9 9 0 0 1-9-9V10Z"
                  fill="url(#pouchGradient)"
                  stroke="#FFFFFF"
                  strokeWidth={1.4}
                />
                {/* top fold */}
                <path
                  d="M-14 -11h28"
                  stroke="#0B1730"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
                {/* zipper seal line, bright against the gradient */}
                <path
                  d="M-16 3h32"
                  stroke="#FFF7D1"
                  strokeWidth={2}
                  strokeDasharray="2.4 3"
                  strokeLinecap="round"
                />
                {/* little colourful label dot, like a brand sticker */}
                <circle cx={9} cy={16} r={4} fill="#22C55E" stroke="#0B1730" strokeWidth={1} />
              </motion.g>
            </motion.g>
          </svg>

          {/* HTML content cards, aligned to each waypoint */}
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className={`absolute w-[86%] max-w-sm sm:w-[42%] ${
                  isLeft
                    ? "left-0 text-left sm:pr-6"
                    : "right-0 text-left sm:pl-6 sm:text-right"
                }`}
                style={{
                  top: STEP_H * i + STEP_H / 2 - 90,
                }}
              >
                <div
                  className={`inline-flex items-center gap-3 ${
                    isLeft ? "" : "sm:flex-row-reverse"
                  }`}
                >
                  <span
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-4xl shadow-lg"
                    style={{
                      backgroundColor: `${step.color}26`, // ~15% tint
                      boxShadow: `0 0 26px ${step.color}55`,
                      border: `2px solid ${step.color}`,
                    }}
                  >
                    {step.emoji}
                  </span>
                  <span
                    className="text-xs font-bold tracking-[0.18em]"
                    style={{ color: step.color }}
                  >
                    STEP {step.n}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#B7C0CC] sm:text-[15px]">
                  {step.copy}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
