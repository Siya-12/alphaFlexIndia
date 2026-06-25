import ProductCard from "./ProductCard";
import { products } from "@/data/products";

export default function ProductsSection() {
  return (
    <section
      className="
      py-20
      px-4
      bg-slate-50
      "
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2
            className="
            text-4xl
            md:text-5xl
            font-bold
            text-slate-900
            "
          >
            Our Packaging Solutions
          </h2>

          <p
            className="
            mt-4
            text-slate-600
            max-w-2xl
            mx-auto
            "
          >
            High-quality packaging products
            designed for e-commerce,
            logistics, manufacturing and retail.
          </p>
        </div>

        <div
          className="
          mt-14
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-8
          "
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              description={product.description}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}