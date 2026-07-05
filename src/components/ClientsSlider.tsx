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
    <section id="clients" className="py-14 pb-2 bg-surface border-t border-surface2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-sm font-medium text-navy bg-white px-4 py-1.5 rounded-full border border-ink/5 mb-4">
            Our Clients
          </div>
          <h2 className="text-3xl font-bold text-navy">
            Trusted by <em className="font-serif italic text-indigo not-italic-fallback">Industry Leaders</em>
          </h2>
          <p className="text-ink/60 mt-3 max-w-2xl mx-auto">
            Alpha Flex India proudly manufactures solutions trusted by leading brands in FMCG, Retail,
            Fashion, Personal Care, Food, Pharmaceuticals, and Consumer Goods across India.
          </p>
        </div>

        <div className="overflow-hidden w-full">
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