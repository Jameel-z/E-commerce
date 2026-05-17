"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui";
import { Input } from "@/shared/components/ui";
import { apiClient, type Product, type Category } from "@/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import { GripVertical, Package, FolderOpen, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl, getProductImageUrl } from "@/shared/utils/image";

const PAGE_SIZE = 10;

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        on ? "bg-secondary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Sortable product row ──────────────────────────────────────────────────────

function SortableProductRow({
  product,
  index,
  onToggle,
  searching,
}: {
  product: Product;
  index: number;
  onToggle: (id: number, val: boolean) => void;
  searching: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-3 py-2 w-10 text-xs text-muted-foreground text-center select-none">
        {!searching ? (
          <button
            {...attributes}
            {...listeners}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span>{index + 1}</span>
        )}
      </td>
      <td className="px-2 py-2 w-10">
        <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
          {product.primary_image_url ? (
            <img src={getProductImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}
        </div>
      </td>
      <td className="px-2 py-2 text-sm text-foreground">
        <span className="line-clamp-1">{product.name}</span>
      </td>
      <td className="px-3 py-2 w-14 text-center">
        <Toggle
          on={!!(product as any).is_featured}
          onToggle={() => onToggle(product.id, !(product as any).is_featured)}
        />
      </td>
    </tr>
  );
}

// ── Sortable category row ─────────────────────────────────────────────────────

function SortableCategoryRow({
  category,
  index,
  onToggle,
  searching,
}: {
  category: Category;
  index: number;
  onToggle: (id: number, val: boolean) => void;
  searching: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const imgUrl = category.image_url ? getImageUrl(category.image_url) : null;

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-3 py-2 w-10 text-xs text-muted-foreground text-center select-none">
        {!searching ? (
          <button
            {...attributes}
            {...listeners}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span>{index + 1}</span>
        )}
      </td>
      <td className="px-2 py-2 w-10">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {imgUrl ? (
            <img src={imgUrl} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}
        </div>
      </td>
      <td className="px-2 py-2 text-sm text-foreground">
        <span className="line-clamp-1">{category.name}</span>
      </td>
      <td className="px-3 py-2 w-14 text-center">
        <Toggle
          on={!!category.show_on_homepage}
          onToggle={() => onToggle(category.id, !category.show_on_homepage)}
        />
      </td>
    </tr>
  );
}

// ── Pagination bar ────────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  onPage,
}: {
  page: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
      <span className="text-xs text-muted-foreground">{from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPage(i)}
            className={`w-6 h-6 text-xs rounded transition-colors ${
              i === page ? "bg-secondary text-secondary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages - 1}
          className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomepageManagementPage() {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [productPage, setProductPage] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([apiClient.getProducts({ per_page: 100 }), apiClient.getFeaturedProducts()])
      .then(([all, featured]) => {
        const featuredMap = new Map(
          featured.map((p, i) => [p.id, { is_featured: true, featured_order: i }])
        );
        const merged = all.map((p) => ({
          ...p,
          is_featured: featuredMap.has(p.id),
          featured_order: featuredMap.get(p.id)?.featured_order ?? 999,
        }));
        merged.sort((a, b) => {
          const aF = (a as any).is_featured;
          const bF = (b as any).is_featured;
          if (aF && bF) return (a as any).featured_order - (b as any).featured_order;
          if (aF) return -1;
          if (bF) return 1;
          return 0;
        });
        setProducts(merged as any);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    Promise.all([apiClient.getCategories(), apiClient.getFeaturedCategories()])
      .then(([all, featured]) => {
        const featuredMap = new Map(
          featured.map((c, i) => [c.id, { show_on_homepage: true, homepage_order: i }])
        );
        const merged = all.map((c) => ({
          ...c,
          show_on_homepage: featuredMap.has(c.id),
          homepage_order: featuredMap.get(c.id)?.homepage_order ?? 999,
        }));
        merged.sort((a, b) => {
          if (a.show_on_homepage && b.show_on_homepage)
            return a.homepage_order - b.homepage_order;
          if (a.show_on_homepage) return -1;
          if (b.show_on_homepage) return 1;
          return 0;
        });
        setCategories(merged);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  // ── Filtered + paginated lists ──────────────────────────────────────────────

  const filteredProducts = useMemo(() =>
    productSearch.trim()
      ? products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
      : products,
    [products, productSearch]
  );

  const filteredCategories = useMemo(() =>
    categorySearch.trim()
      ? categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
      : categories,
    [categories, categorySearch]
  );

  const pagedProducts = filteredProducts.slice(productPage * PAGE_SIZE, (productPage + 1) * PAGE_SIZE);
  const pagedCategories = filteredCategories.slice(categoryPage * PAGE_SIZE, (categoryPage + 1) * PAGE_SIZE);

  // Reset to page 0 on search change
  const handleProductSearch = (v: string) => { setProductSearch(v); setProductPage(0); };
  const handleCategorySearch = (v: string) => { setCategorySearch(v); setCategoryPage(0); };

  // ── Product handlers ────────────────────────────────────────────────────────

  const handleProductDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setProducts((prev) => {
        const oldIdx = prev.findIndex((p) => p.id === active.id);
        const newIdx = prev.findIndex((p) => p.id === over.id);
        const reordered = arrayMove(prev, oldIdx, newIdx);
        reordered.forEach((p, i) => {
          if ((p as any).is_featured) {
            apiClient.setProductFeatured(p.id, true, i).catch(() => {});
          }
        });
        return reordered;
      });
    },
    []
  );

  const handleProductToggle = useCallback(
    async (id: number, newVal: boolean) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_featured: newVal } : p))
      );
      try {
        const order = newVal ? products.filter((p) => (p as any).is_featured).length : 0;
        await apiClient.setProductFeatured(id, newVal, order);
        toast({
          title: newVal ? "Added to Featured" : "Removed from Featured",
          description: newVal ? "Product will now appear on the homepage." : "Product removed from homepage.",
        });
      } catch {
        toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_featured: !newVal } : p))
        );
      }
    },
    [products, toast]
  );

  // ── Category handlers ───────────────────────────────────────────────────────

  const handleCategoryDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setCategories((prev) => {
        const oldIdx = prev.findIndex((c) => c.id === active.id);
        const newIdx = prev.findIndex((c) => c.id === over.id);
        const reordered = arrayMove(prev, oldIdx, newIdx);
        reordered.forEach((c, i) => {
          if (c.show_on_homepage) {
            apiClient.setCategoryFeatured(c.id, true, i).catch(() => {});
          }
        });
        return reordered;
      });
    },
    []
  );

  const handleCategoryToggle = useCallback(
    async (id: number, newVal: boolean) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, show_on_homepage: newVal } : c))
      );
      try {
        const order = newVal ? categories.filter((c) => c.show_on_homepage).length : 0;
        await apiClient.setCategoryFeatured(id, newVal, order);
        toast({
          title: newVal ? "Added to Homepage" : "Removed from Homepage",
          description: newVal ? "Category will now appear on the homepage." : "Category removed from homepage.",
        });
      } catch {
        toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, show_on_homepage: !newVal } : c))
        );
      }
    },
    [categories, toast]
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  const featuredProductCount = products.filter((p) => (p as any).is_featured).length;
  const featuredCategoryCount = categories.filter((c) => c.show_on_homepage).length;
  const isProductSearching = productSearch.trim().length > 0;
  const isCategorySearching = categorySearch.trim().length > 0;

  return (
    <AdminLayout title="Homepage Management">
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Shop by Category ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-secondary" />
                Shop by Category
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {featuredCategoryCount} selected
              </span>
            </CardTitle>
            <div className="relative mt-1.5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => handleCategorySearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingCategories ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCategoryDragEnd}
                >
                  <SortableContext
                    items={pagedCategories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-3 py-1.5 text-left w-10">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {isCategorySearching ? "#" : "⠿"}
                            </span>
                          </th>
                          <th className="px-2 py-1.5 w-10" />
                          <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Category
                          </th>
                          <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-14">
                            Show
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedCategories.map((cat, i) => (
                          <SortableCategoryRow
                            key={cat.id}
                            category={cat}
                            index={categoryPage * PAGE_SIZE + i}
                            onToggle={handleCategoryToggle}
                            searching={isCategorySearching}
                          />
                        ))}
                        {pagedCategories.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                              No categories found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </SortableContext>
                </DndContext>
                <Pagination
                  page={categoryPage}
                  total={filteredCategories.length}
                  onPage={setCategoryPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Featured Products ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-secondary" />
                Featured Products
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {featuredProductCount} selected
              </span>
            </CardTitle>
            <div className="relative mt-1.5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => handleProductSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleProductDragEnd}
                >
                  <SortableContext
                    items={pagedProducts.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-3 py-1.5 text-left w-10">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {isProductSearching ? "#" : "⠿"}
                            </span>
                          </th>
                          <th className="px-2 py-1.5 w-10" />
                          <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Product
                          </th>
                          <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-14">
                            Feature
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedProducts.map((product, i) => (
                          <SortableProductRow
                            key={product.id}
                            product={product}
                            index={productPage * PAGE_SIZE + i}
                            onToggle={handleProductToggle}
                            searching={isProductSearching}
                          />
                        ))}
                        {pagedProducts.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </SortableContext>
                </DndContext>
                <Pagination
                  page={productPage}
                  total={filteredProducts.length}
                  onPage={setProductPage}
                />
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
