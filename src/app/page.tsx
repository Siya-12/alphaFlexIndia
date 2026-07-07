import Hero from "@/components/hero/Hero";
// import Navbar from "@/components/navbar/Navbar";
import ProductsSection from "@/components/products/ProductsSection";
import ClientsSlider from "@/components/ClientsSlider";
import ManufacturingProcess from "@/components/ManufacturingProcess";


export default function Home() {
  return (
    <>
    {/* <Navbar /> */}
      <Hero />
       <ClientsSlider />
      <ProductsSection />
      <ManufacturingProcess/>
    </>
  );
}