import Hero from "@/components/hero/Hero";
import ProductsSection from "@/components/products/ProductsSection";
import ClientsSlider from "@/components/ClientsSlider";
import ManufacturingProcess from "@/components/ManufacturingProcess";
import OurMachines from "@/components/OurMachines";
import Gallery from "@/components/Gallery";
import WhyUs from "@/components/WhyUs";
import NoticeBoard from "@/components/NoticeBoard";

export const metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <>
    {/* <Navbar /> */}
      <Hero />
       <ClientsSlider />
      <ProductsSection />    
      <ManufacturingProcess/>
      <Gallery/>
      <WhyUs/>
      <OurMachines/>
      <NoticeBoard/>
    </>
  );
}