import ProductGrid from "@/components/ProductGrid";
import { connectToDatabase } from "@/utils/db";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { db } = await connectToDatabase();
  
  const category = await db.collection("categories").findOne({
    slug: params.slug,
    active: true,
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
        <p className="text-gray-600">{category.description}</p>
      </div>

      <ProductGrid categoryId={category._id.toString()} />
    </div>
  );
}
