"use client"

import Image from "next/image";

type Machine = {
  name: string;
  subtitle: string;
  src: string | null; // null until a real photo is added
  alt: string;
};

const machines: Machine[] = [
  {
    name: "3 Layer Co-Extrusion Machine",
    subtitle:
      "Ashoka Industries, Shubham Extrusion, Windsor, Rajoo Engineers, Kolsite Kabra",
    src: "/machines/co-extrusion.png",  
    alt: "3 layer co-extrusion machine on the production floor",
  },
  {
    name: "Plastic Courier Bag Machine",
    subtitle:
      "Mamata Machinery Pvt. Ltd., Cosmos Plastic Machinery, RS Engineering Works",
    src: "/machines/courier-bag.png", 
    alt: "Plastic courier bag manufacturing machine",
  },
  {
    name: "Labels Machine",
    subtitle: "RK Label Machine Pvt. Ltd. — precision label manufacturing",
    src: "/machines/labels.jpg", 
    alt: "Precision label manufacturing machine",
  },
  {
    name: "3-Colour Printing & Lamination",
    subtitle: "Mohindra Engineering Company — vibrant brand printing on all packaging",
    src: "/machines/printing-lamination.png",  
    alt: "3-colour printing and lamination machine",
  },
  {
    name: "Poly Recycle Machine",
    subtitle: "Automatic Pouch Recycle Machine by Panchal Machinery",
    src: "/machines/poly-recycle.png", 
    alt: "Automatic poly recycle machine",
  },
  {
    name: "Bottom Seal Machine",
    subtitle:
      '55" capacity machine (max 50×80") by Yadav Machinery + Unique Barcode Printer',
    src: "/machines/bottom-seal.png",
    alt: "Bottom seal machine with barcode printer",
  },
];

export default function OurMachines() {
  return (
    <section  id="machines" className="bg-[#F7F8FA] py-20 sm:py-28">
       <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
             <em className="not-italic text-[#051c4d]">Our Machines</em>{" "}
            
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#25282b] sm:text-lg">
            State-of-the-art equipment installed at our manufacturing unit in
            Narela, Delhi.
          </p>
        </div>
      {/* <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#0E1B4D] sm:text-4xl">
            Our <em className="italic text-amber-500">Machines</em>
          </h2>
          <p className="mt-3 text-base text-[#97A0AC] sm:text-lg">
            State-of-the-art equipment installed at our manufacturing unit in
            Narela, Delhi.
          </p>
        </div> */}

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
          {machines.map((machine) => (
            <MachineCard key={machine.name} machine={machine} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MachineCard({ machine }: { machine: Machine }) {
  return (
    <div className="group">
      {/* Photo — big, square, zooms on hover with the name flashing over it */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#E9EBEF] shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-xl">
        {machine.src ? (
          <Image
            src={machine.src}
            alt={machine.alt}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          // Placeholder slot — remove this block once `src` is set above.
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110">
            <span className="px-4 text-center text-sm font-medium text-[#97A0AC]">
              Photo coming soon
            </span>
          </div>
        )}

        {/* Dark overlay + flashing name, appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 p-4 text-center opacity-0 transition-all duration-300 group-hover:bg-black/55 group-hover:opacity-100">
          <span className="machine-name text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
            {machine.name}
          </span>
        </div>
      </div>

      {/* Static caption — always visible, so info isn't hover-only on touch devices */}
      <h3 className="mt-4 text-base font-semibold text-[#0E1B4D] sm:text-lg">
        {machine.name}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-[#97A0AC]">
        {machine.subtitle}
      </p>

      {/* Scoped flash animation for the overlay name on hover */}
      <style jsx>{`
        .group:hover .machine-name {
          animation: machineFlash 1.1s ease-in-out infinite;
        }
        @keyframes machineFlash {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.35;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .group:hover .machine-name {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
