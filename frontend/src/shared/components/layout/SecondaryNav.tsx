"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown, Phone, LayoutGrid } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Category } from "@/shared/types";

function categoryNames(cat: Category): string[] {
  return [cat.name, ...cat.children.map((c) => c.name)];
}

export function SecondaryNav() {
  const [tree, setTree] = useState<Category[]>([]);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.getCategoryTree().then(setTree).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
        setHoveredId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setSearchQuery("");
  };

  const buildCategoryUrl = (names: string[]) =>
    `/products?category=${names.map(encodeURIComponent).join(",")}`;

  return (
    <div className="border-b bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-11 gap-3">

          {/* Categories Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => { setIsCatOpen(!isCatOpen); setHoveredId(null); }}
              className="flex items-center gap-1.5 h-8 px-3 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Categories</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCatOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-card border rounded-lg shadow-xl z-50 py-1 max-h-80 overflow-y-auto">
                {/* All Products */}
                <Link
                  href="/products"
                  className="flex items-center px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => { setIsCatOpen(false); setHoveredId(null); }}
                >
                  All Products
                </Link>
                <div className="my-1 border-t" />

                {tree.length === 0 && (
                  <span className="block px-4 py-2 text-sm text-muted-foreground">Loading…</span>
                )}

                {tree.map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => cat.children.length > 0 ? setHoveredId(cat.id) : setHoveredId(null)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Parent row */}
                    <Link
                      href={buildCategoryUrl(categoryNames(cat))}
                      className="flex items-center px-4 py-2 text-sm font-medium hover:bg-muted transition-colors gap-2"
                      onClick={() => { setIsCatOpen(false); setHoveredId(null); }}
                    >
                      <span className="flex-1">{cat.name}</span>

                      {/* Colored badge arrow — visible indicator for categories with children */}
                      {cat.children.length > 0 && (
                        <span className={`
                          text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors duration-150
                          ${hoveredId === cat.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/15 text-primary"}
                        `}>
                          {cat.children.length} ›
                        </span>
                      )}
                    </Link>

                    {/* Children — shown on hover */}
                    {hoveredId === cat.id && cat.children.length > 0 && (
                      <div className="bg-muted/50 border-t border-b">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={buildCategoryUrl([child.name])}
                            className="flex items-center pl-6 pr-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors gap-2"
                            onClick={() => { setIsCatOpen(false); setHoveredId(null); }}
                          >
                            <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border flex-shrink-0" />

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full h-8 pl-8 pr-3 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Phone */}
          <a
            href="tel:+9611657725"
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>+961 1 657 725</span>
          </a>
        </div>
      </div>
    </div>
  );
}
