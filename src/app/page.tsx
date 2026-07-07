import Hero from "@/components/hero/Hero";
import ProductsSection from "@/components/products/ProductsSection";
import ClientsSlider from "@/components/ClientsSlider";
import ManufacturingProcess from "@/components/ManufacturingProcess";
import OurMachines from "@/components/OurMachines";

export default function Home() {
  return (
    <>
    {/* <Navbar /> */}
      <Hero />
       <ClientsSlider />
      <ProductsSection />
      <ManufacturingProcess/>
      <OurMachines/>
    </>
  );
}