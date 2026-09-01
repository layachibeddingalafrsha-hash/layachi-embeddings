"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  variants: any[];
}

interface ProductGridProps {
  initialLimit?: number;
  categoryId?: string;
}

export default function ProductGrid({ initialLimit = 12, categoryId }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  async function fetchProducts(pageNum: number, append = false) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: initialLimit.toString(),
        sort: "topSelling",
      });

      if (categoryId) {
        params.append("category", categoryId);
      }

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      const nextProducts: Product[] = Array.isArray(data?.products) ? data.products : [];
      const nextTotal: number = typeof data?.total === "number" ? data.total : 0;

      setProducts((prev) => {
        const updated = append ? [...prev, ...nextProducts] : nextProducts;
        setHasMore(updated.length < nextTotal && nextProducts.length === initialLimit);
        return updated;
      });

      setTotal(nextTotal);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setHasMore(false);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts(1);
  }, [categoryId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {loading && page === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && hasMore && (
        <div className="text-center mt-12">
          <button onClick={loadMore} className="btn btn-primary" disabled={loading}>
            {loading ? "Loading..." : "Show More"}
          </button>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No products found.</p>
        </div>
      )}

      {!loading && !hasMore && products.length > 0 && (
        <div className="text-center mt-12 text-gray-500">
          <p>Showing all {total} products</p>
        </div>
      )}
    </div>
  );
}
