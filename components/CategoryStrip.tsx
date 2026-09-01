"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackCustomEvent } from "@/components/MetaPixel";

interface Category {
  _id: string;
  name: string;
  slug?: string;  // Optional since categories might not have slugs
  image: string;
  description?: string;
}

export default function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        console.log('🏷️ CategoryStrip loaded:', data.map((c: Category) => ({
          id: c._id,
          name: c.name
        })));
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-40"></div>
          </div>
        ))}
      </div>
    );
  }

  console.log(categories);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-start">
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/products?category=${category._id}`}
          className="group card overflow-hidden block"
          onClick={(e) => {
            console.log('🖱️ Category card clicked:', { id: category._id, name: category.name });
            trackCustomEvent("CategoryClick", { category_id: category._id, category_name: category.name, source: "category_strip" });
            // Prevent multiple clicks
            e.currentTarget.style.pointerEvents = 'none';
            setTimeout(() => {
              e.currentTarget.style.pointerEvents = 'auto';
            }, 1000);
          }}
        >
          <div className="relative w-full">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-auto block group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-end justify-center pointer-events-none">
              <h3 className="text-white text-lg md:text-xl font-semibold text-center drop-shadow-md">
                {category.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
