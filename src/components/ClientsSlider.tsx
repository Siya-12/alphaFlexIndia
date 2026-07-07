const clientLogos = [
  { src: "/logos/amar.png", alt: "Amar" },
  { src: "/logos/miss-mosa.png", alt: "Miss Mosa" },
  { src: "/logos/vero-moda.png", alt: "Vero Moda" },
  { src: "/logos/dabur.png", alt: "Dabur" },
  { src: "/logos/jack-jones.png", alt: "Jack & Jones" },
  { src: "/logos/finopack.png", alt: "Finopack" },
  { src: "/logos/pilgrim.png", alt: "Pilgrim" },
  { src: "/logos/caredone.png", alt: "Caredone" },
  { src: "/logos/only.png", alt: "Only" },
  { src: "/logos/joypack.png", alt: "Joypack" },
  { src: "/logos/crepdog.png", alt: "Crepdog" },
  { src: "/logos/magnum.png", alt: "Magnum" },
  { src: "/logos/zavenir.png", alt: "Zavenir" },
  { src: "/logos/selected.png", alt: "Selected" },
  { src: "/logos/uptownie.png", alt: "Uptownie" },
];

export default function ClientsSlider() {
  // duplicate the array once for a seamless loop (matches original "Set 1 / Set 2" markup)
  const loopedLogos = [...clientLogos, ...clientLogos];

  return (
    <section id="clients" className="py-14 pb-2 bg- border-t border-surface2 bg-[#0B1730]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full border border-[#4C5FE0]/40 bg-[#4C5FE0]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9AA6F5]">
            Trusted by Industry Leaders
          </span>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Our <em className="not-italic text-[#4C5FE0]">Clients</em>{" "}
          </h2>
          <p className="text-[#B7C0CC] mt-3 max-w-2xl mx-auto">
            Alpha Flex India proudly manufactures solutions trusted by leading brands in FMCG, Retail,
            Fashion, Personal Care, Food, Pharmaceuticals, and Consumer Goods across India.
          </p>
        </div>

        <div className="overflow-hidden w-full bg-white">
          <div className="flex items-center w-max animate-clients-scroll hover:[animation-play-state:paused]">
            {loopedLogos.map((logo, i) => (
              <div
                key={`${logo.alt}-${i}`}
                className="min-w-[180px] h-[100px] flex items-center justify-center px-6 border-r border-ink/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="block h-13 w-auto max-w-[150px] object-contain opacity-90 transition-all duration-300 hover:scale-105 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}