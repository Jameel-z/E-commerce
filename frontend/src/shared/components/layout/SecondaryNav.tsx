"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown, Phone, LayoutGrid, ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Category, Product } from "@/shared/types";
import { CONTACT } from "@/shared/constants/config";
import { getProductImageUrl } from "@/shared/utils/image";

function categoryNames(cat: Category): string[] {
  return [cat.name, ...cat.children.map((c) => c.name)];
}

export function SecondaryNav() {
  const [tree, setTree] = useState<Category[]>([]);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.getCategoryTree().then(setTree).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
        setHoveredId(null);
        setExpandedId(null);
        setShowSuggestions(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await apiClient.getProducts({ search: searchQuery, per_page: 6 });
        setSuggestions(Array.isArray(results) ? results.slice(0, 6) : []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setShowSuggestions(false);
    setIsCatOpen(false);
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setSearchQuery("");
  };

  const handleSuggestionClick = (product: Product) => {
    setShowSuggestions(false);
    setSearchQuery("");
    setIsCatOpen(false);
    router.push(`/products/${product.id}`);
  };

  const buildCategoryUrl = (names: string[]) =>
    `/products?category=${names.map(encodeURIComponent).join(",")}`;

  const closeAll = () => { setIsCatOpen(false); setHoveredId(null); setExpandedId(null); };

  return (
    <div className="border-b bg-muted/50 relative" ref={navRef}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center h-10 gap-2 sm:gap-3">

          {/* ── Hamburger / Categories button ─────────────────────────── */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => { setIsCatOpen(!isCatOpen); setHoveredId(null); setExpandedId(null); }}
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {isCatOpen
                ? <X className="h-4 w-4 sm:hidden" />
                : <Menu className="h-4 w-4 sm:hidden" />
              }
              <LayoutGrid className="h-3.5 w-3.5 hidden sm:block" />
              <span className="hidden sm:inline">Categories</span>
              <ChevronDown className={`h-3.5 w-3.5 hidden sm:block transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Desktop dropdown — categories only */}
            {isCatOpen && (
              <div className="hidden sm:block absolute top-full left-0 mt-1 w-64 bg-card border rounded-lg shadow-xl z-50 py-1 max-h-80 overflow-y-auto">
                <Link
                  href="/products"
                  className="flex items-center px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                  onClick={closeAll}
                >
                  All Products
                </Link>
                <div className="border-t" />
                {tree.length === 0 && (
                  <span className="block px-4 py-2 text-sm text-muted-foreground">Loading…</span>
                )}
                {tree.map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => cat.children.length > 0 && setHoveredId(cat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <Link
                      href={buildCategoryUrl(categoryNames(cat))}
                      className="flex items-center px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors gap-2"
                      onClick={closeAll}
                    >
                      <span className="flex-1">{cat.name}</span>
                      {cat.children.length > 0 && (
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${hoveredId === cat.id ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}>
                          {cat.children.length} ›
                        </span>
                      )}
                    </Link>
                    {hoveredId === cat.id && cat.children.length > 0 && (
                      <div className="bg-muted/50 border-t border-b">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={buildCategoryUrl([child.name])}
                            className="flex items-center pl-6 pr-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors gap-2"
                            onClick={closeAll}
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

          {/* ── Shop Now ──────────────────────────────────────────────── */}
          <Link
            href="/products"
            className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-sm font-semibold rounded-md flex-shrink-0 text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4285F4 0%, #0f5fe8 100%)" }}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Shop Now</span>
          </Link>

          {/* ── Divider (desktop only) ────────────────────────────────── */}
          <div className="hidden sm:block h-5 w-px bg-border flex-shrink-0" />

          {/* ── Search bar — always visible, flex-1 takes remaining space  */}
          <form onSubmit={handleSearch} className="flex items-center gap-1.5 flex-1">
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setShowSuggestions(false)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search…"
                className="w-full h-8 pl-8 pr-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                autoComplete="off"
              />

              {/* Autocomplete dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 bg-muted/60 border-b">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {loadingSuggestions ? "Searching…" : "Products"}
                    </span>
                  </div>
                  {suggestions.length > 0 ? (
                    <>
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors border-b last:border-b-0 text-left"
                        >
                          <div className="w-10 h-10 flex-shrink-0 rounded border bg-white overflow-hidden">
                            <img src={getProductImageUrl(product)} alt={product.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {product.is_on_sale && product.sale_price ? (
                                <>
                                  <span className="text-xs font-bold text-primary">${product.sale_price}</span>
                                  <span className="text-xs text-muted-foreground line-through">${product.regular_price}</span>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-foreground">${product.price}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                      <button type="submit" className="w-full px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors text-center border-t">
                        See all results for &quot;{searchQuery}&quot; →
                      </button>
                    </>
                  ) : !loadingSuggestions ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">No products found</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Submit: icon on mobile, text on desktop */}
            <button
              type="submit"
              className="h-8 w-8 sm:w-auto sm:px-3 flex items-center justify-center text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <ArrowRight className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* ── Phone (desktop only) ──────────────────────────────────── */}
          <a
            href={`tel:${CONTACT.phone.tel}`}
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{CONTACT.phone.display}</span>
          </a>
        </div>
      </div>

      {/* ── Mobile categories panel (categories only, no search) ──────────── */}
      {isCatOpen && (
        <div className="sm:hidden absolute left-0 right-0 top-full bg-card border-b shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
          <div className="py-1">
            <Link
              href="/products"
              className="flex items-center px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
              onClick={closeAll}
            >
              All Products
            </Link>
            <div className="border-t" />
            {tree.length === 0 && (
              <span className="block px-4 py-3 text-sm text-muted-foreground">Loading…</span>
            )}
            {tree.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center">
                  <Link
                    href={buildCategoryUrl(categoryNames(cat))}
                    className="flex-1 flex items-center px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                    onClick={closeAll}
                  >
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 && (
                    <button
                      className="px-4 py-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === cat.id ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
                {expandedId === cat.id && cat.children.length > 0 && (
                  <div className="bg-muted/30 border-t border-b">
                    {cat.children.map((child) => (
                      <Link
                        key={child.id}
                        href={buildCategoryUrl([child.name])}
                        className="flex items-center pl-8 pr-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors gap-2"
                        onClick={closeAll}
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
        </div>
      )}
    </div>
  );
}
