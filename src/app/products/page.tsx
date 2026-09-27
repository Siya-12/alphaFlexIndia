import ProductList from "./ProductList";

export const metadata = {
  title: "Products",
  description:
    "Explore our range of flexible packaging products including pouches, laminated rolls and customized packaging.",
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Our Products
          </h1>

          <p className="text-gray-600 mt-2">
            Explore our range of flexible packaging products.
          </p>
        </div>

        <ProductList />

      </div>
    </main>
  );
}