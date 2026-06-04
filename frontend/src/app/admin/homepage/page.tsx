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
import { GripVertical, Package, FolderOpen, Loader2, Search, ChevronLeft, ChevronRight, LayoutList, Pencil, X, ArrowUp, ArrowDown, ChevronsUp } from "lucide-react";
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
  onMoveToTop,
  searching,
}: {
  product: Product;
  index: number;
  onToggle: (id: number, val: boolean) => void;
  onMoveToTop: (id: number) => void;
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
      <td className="px-2 py-2 w-16 text-center">
        <button
          onClick={() => onMoveToTop(product.id)}
          title="Move to top"
          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-secondary transition-colors"
        >
          <ChevronsUp className="w-3.5 h-3.5" />
          Top
        </button>
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

// ── Sortable category row (for Shop by Category) ─────────────────────────────

function SortableCategoryRow({
  category,
  index,
  onToggle,
  onMoveToTop,
  searching,
}: {
  category: Category;
  index: number;
  onToggle: (id: number, val: boolean) => void;
  onMoveToTop: (id: number) => void;
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
      <td className="px-2 py-2 w-16 text-center">
        <button
          onClick={() => onMoveToTop(category.id)}
          title="Move to top"
          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-secondary transition-colors"
        >
          <ChevronsUp className="w-3.5 h-3.5" />
          Top
        </button>
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


// ── Sortable category row entry (for Category Product Rows with pin button) ───

function SortableCategoryRowEntry({
  category,
  index,
  onToggle,
  onEdit,
  searching,
}: {
  category: Category;
  index: number;
  onToggle: (id: number, val: boolean) => void;
  onEdit: (cat: Category) => void;
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
          <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : <span>{index + 1}</span>}
      </td>
      <td className="px-2 py-2 w-10">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {imgUrl ? <img src={imgUrl} alt={category.name} className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center"><FolderOpen className="w-3.5 h-3.5 text-muted-foreground" /></div>
          )}
        </div>
      </td>
      <td className="px-2 py-2 text-sm text-foreground">
        <span className="line-clamp-1">{category.name}</span>
      </td>
      <td className="px-2 py-2 text-center">
        <button
          onClick={() => onEdit(category)}
          className="inline-flex items-center gap-1 text-[10px] font-medium text-secondary hover:underline"
        >
          <Pencil className="w-3 h-3" /> Edit pins
        </button>
      </td>
      <td className="px-3 py-2 w-14 text-center">
        <Toggle on={!!category.show_category_row} onToggle={() => onToggle(category.id, !category.show_category_row)} />
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
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCategoryRows, setLoadingCategoryRows] = useState(true);

  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryRowSearch, setCategoryRowSearch] = useState("");
  const [productPage, setProductPage] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryRowPage, setCategoryRowPage] = useState(0);

  // Pin modal state
  const [pinningCategory, setPinningCategory] = useState<Category | null>(null);
  const [pinnedProducts, setPinnedProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [pinSearch, setPinSearch] = useState("");
  const [loadingPins, setLoadingPins] = useState(false);
  const [savingPins, setSavingPins] = useState(false);

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

  useEffect(() => {
    Promise.all([apiClient.getCategories(), apiClient.getCategoryRows()])
      .then(([all, rows]) => {
        // Only show parent categories (parent_id === null)
        const parents = all.filter((c) => c.parent_id === null);
        const rowMap = new Map(
          rows.map((c, i) => [c.id, { show_category_row: true, category_row_order: i }])
        );
        const merged = parents.map((c) => ({
          ...c,
          show_category_row: rowMap.has(c.id),
          category_row_order: rowMap.get(c.id)?.category_row_order ?? 999,
        }));
        merged.sort((a, b) => {
          const aR = a.show_category_row;
          const bR = b.show_category_row;
          if (aR && bR) return (a.category_row_order ?? 999) - (b.category_row_order ?? 999);
          if (aR) return -1;
          if (bR) return 1;
          return 0;
        });
        setCategoryRows(merged);
      })
      .finally(() => setLoadingCategoryRows(false));
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

  const filteredCategoryRows = useMemo(() =>
    categoryRowSearch.trim()
      ? categoryRows.filter((c) => c.name.toLowerCase().includes(categoryRowSearch.toLowerCase()))
      : categoryRows,
    [categoryRows, categoryRowSearch]
  );

  const pagedProducts = filteredProducts.slice(productPage * PAGE_SIZE, (productPage + 1) * PAGE_SIZE);
  const pagedCategories = filteredCategories.slice(categoryPage * PAGE_SIZE, (categoryPage + 1) * PAGE_SIZE);
  const pagedCategoryRows = filteredCategoryRows.slice(categoryRowPage * PAGE_SIZE, (categoryRowPage + 1) * PAGE_SIZE);

  // Reset to page 0 on search change
  const handleProductSearch = (v: string) => { setProductSearch(v); setProductPage(0); };
  const handleCategorySearch = (v: string) => { setCategorySearch(v); setCategoryPage(0); };
  const handleCategoryRowSearch = (v: string) => { setCategoryRowSearch(v); setCategoryRowPage(0); };

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

  const handleProductMoveToTop = useCallback(
    async (id: number) => {
      setProducts((prev) => {
        const item = prev.find((p) => p.id === id);
        if (!item) return prev;
        const updated = { ...item, is_featured: true };
        const rest = prev.filter((p) => p.id !== id);
        const reordered = [updated, ...rest];
        reordered.forEach((p, i) => {
          if ((p as any).is_featured) {
            apiClient.setProductFeatured(p.id, true, i).catch(() => {});
          }
        });
        return reordered;
      });
      toast({ title: "Moved to top", description: "Product is now #1 in Featured Products." });
    },
    [toast]
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

  const handleCategoryMoveToTop = useCallback(
    async (id: number) => {
      setCategories((prev) => {
        const item = prev.find((c) => c.id === id);
        if (!item) return prev;
        const updated = { ...item, show_on_homepage: true };
        const rest = prev.filter((c) => c.id !== id);
        const reordered = [updated, ...rest];
        reordered.forEach((c, i) => {
          if (c.show_on_homepage) {
            apiClient.setCategoryFeatured(c.id, true, i).catch(() => {});
          }
        });
        return reordered;
      });
      toast({ title: "Moved to top", description: "Category is now #1 in Shop by Category." });
    },
    [toast]
  );

  // ── Category Row handlers ────────────────────────────────────────────────────

  const handleCategoryRowDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setCategoryRows((prev) => {
        const oldIdx = prev.findIndex((c) => c.id === active.id);
        const newIdx = prev.findIndex((c) => c.id === over.id);
        const reordered = arrayMove(prev, oldIdx, newIdx);
        reordered.forEach((c, i) => {
          if (c.show_category_row) {
            apiClient.setCategoryRow(c.id, true, i).catch(() => {});
          }
        });
        return reordered;
      });
    },
    []
  );

  const handleCategoryRowToggle = useCallback(
    async (id: number, newVal: boolean) => {
      setCategoryRows((prev) =>
        prev.map((c) => (c.id === id ? { ...c, show_category_row: newVal } : c))
      );
      try {
        const order = newVal ? categoryRows.filter((c) => c.show_category_row).length : 0;
        await apiClient.setCategoryRow(id, newVal, order);
        toast({
          title: newVal ? "Row Enabled" : "Row Disabled",
          description: newVal ? "Category row will appear on the homepage." : "Category row removed from homepage.",
        });
      } catch {
        toast({ title: "Error", description: "Failed to update category row.", variant: "destructive" });
        setCategoryRows((prev) =>
          prev.map((c) => (c.id === id ? { ...c, show_category_row: !newVal } : c))
        );
      }
    },
    [categoryRows, toast]
  );

  // ── Pin modal handlers ──────────────────────────────────────────────────────

  const openPinModal = useCallback(async (cat: Category) => {
    setPinningCategory(cat);
    setPinSearch("");
    setLoadingPins(true);
    try {
      const [pinIds, products] = await Promise.all([
        apiClient.getCategoryRowPins(cat.id),
        apiClient.getProducts({ parent_category_id: cat.id, per_page: 100 }),
      ]);
      const productMap = new Map(products.map((p) => [p.id, p]));
      const pinned = pinIds.map((id) => productMap.get(id)).filter(Boolean) as Product[];
      setPinnedProducts(pinned);
      setCategoryProducts(products);
    } finally {
      setLoadingPins(false);
    }
  }, []);

  const closePinModal = useCallback(() => {
    setPinningCategory(null);
    setPinnedProducts([]);
    setCategoryProducts([]);
    setPinSearch("");
  }, []);

  const addPin = useCallback((product: Product) => {
    setPinnedProducts((prev) => [...prev, product]);
  }, []);

  const removePin = useCallback((productId: number) => {
    setPinnedProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const movePinUp = useCallback((index: number) => {
    setPinnedProducts((prev) => {
      if (index === 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const movePinDown = useCallback((index: number) => {
    setPinnedProducts((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const savePins = useCallback(async () => {
    if (!pinningCategory) return;
    setSavingPins(true);
    try {
      const result = await apiClient.setCategoryRowPins(pinningCategory.id, pinnedProducts.map((p) => p.id));
      console.log("Pins saved:", result);
      toast({ title: "Pins saved", description: `${pinnedProducts.length} products pinned to ${pinningCategory.name} row.` });

      // Refetch the category rows to show updated pins
      const updatedRows = await apiClient.getCategoryRows();
      setCategoryRows(updatedRows);

      closePinModal();
    } catch (error) {
      console.error("Failed to save pins:", error);
      toast({ title: "Error", description: "Failed to save pins.", variant: "destructive" });
    } finally {
      setSavingPins(false);
    }
  }, [pinningCategory, pinnedProducts, closePinModal, toast]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const featuredProductCount = products.filter((p) => (p as any).is_featured).length;
  const featuredCategoryCount = categories.filter((c) => c.show_on_homepage).length;
  const categoryRowCount = categoryRows.filter((c) => c.show_category_row).length;
  const isProductSearching = productSearch.trim().length > 0;
  const isCategorySearching = categorySearch.trim().length > 0;
  const isCategoryRowSearching = categoryRowSearch.trim().length > 0;

  return (
    <AdminLayout title="Homepage Management">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

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
                          <th className="px-2 py-1.5 w-16" />
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
                            onMoveToTop={handleCategoryMoveToTop}
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
                          <th className="px-2 py-1.5 w-16" />
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
                            onMoveToTop={handleProductMoveToTop}
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

      {/* ── Category Product Rows ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <LayoutList className="h-4 w-4 text-secondary" />
              Category Product Rows
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {categoryRowCount} active
            </span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each enabled parent category shows a row of 5 products on the homepage.
          </p>
          <div className="relative mt-1.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search categories..."
              value={categoryRowSearch}
              onChange={(e) => handleCategoryRowSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loadingCategoryRows ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryRowDragEnd}
              >
                <SortableContext
                  items={pagedCategoryRows.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-1.5 text-left w-10">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {isCategoryRowSearching ? "#" : "⠿"}
                          </span>
                        </th>
                        <th className="px-2 py-1.5 w-10" />
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Category
                        </th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-20">
                          Pin Products
                        </th>
                        <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-14">
                          Show
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedCategoryRows.map((cat, i) => (
                        <SortableCategoryRowEntry
                          key={cat.id}
                          category={cat}
                          index={categoryRowPage * PAGE_SIZE + i}
                          onToggle={handleCategoryRowToggle}
                          onEdit={openPinModal}
                          searching={isCategoryRowSearching}
                        />
                      ))}
                      {pagedCategoryRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                            No parent categories found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </SortableContext>
              </DndContext>
              <Pagination
                page={categoryRowPage}
                total={filteredCategoryRows.length}
                onPage={setCategoryRowPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Pin modal ── */}
      {pinningCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <h2 className="text-sm font-bold text-foreground">Pin Products — {pinningCategory.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Pinned products appear first in the homepage row.</p>
              </div>
              <button onClick={closePinModal} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingPins ? (
              <div className="flex-1 flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex-1 overflow-auto px-5 py-4 space-y-5">

                {/* Pinned list */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Pinned first ({pinnedProducts.length})
                  </h3>
                  {pinnedProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No products pinned yet. Add from below.</p>
                  ) : (
                    <div className="space-y-1">
                      {pinnedProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                          <span className="text-[10px] font-bold text-secondary w-4 text-center">{i + 1}</span>
                          <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                            {p.primary_image_url
                              ? <img src={getProductImageUrl(p)} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package className="w-3 h-3 text-muted-foreground" /></div>}
                          </div>
                          <span className="flex-1 text-sm text-foreground line-clamp-1">{p.name}</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => movePinUp(i)} disabled={i === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button onClick={() => movePinDown(i)} disabled={i === pinnedProducts.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button onClick={() => removePin(p.id)} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add products */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Add from {pinningCategory.name}
                  </h3>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      placeholder="Search products..."
                      value={pinSearch}
                      onChange={(e) => setPinSearch(e.target.value)}
                      className="w-full pl-8 pr-3 h-8 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-auto pr-1">
                    {categoryProducts
                      .filter((p) => !pinnedProducts.some((pp) => pp.id === p.id))
                      .filter((p) => !pinSearch.trim() || p.name.toLowerCase().includes(pinSearch.toLowerCase()))
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addPin(p)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                            {p.primary_image_url
                              ? <img src={getProductImageUrl(p)} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package className="w-3 h-3 text-muted-foreground" /></div>}
                          </div>
                          <span className="text-xs text-foreground line-clamp-2 flex-1">{p.name}</span>
                        </button>
                      ))}
                    {categoryProducts.filter((p) => !pinnedProducts.some((pp) => pp.id === p.id)).length === 0 && (
                      <p className="text-xs text-muted-foreground italic col-span-2">All products are pinned.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
              <button onClick={closePinModal} className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={savePins}
                disabled={savingPins || loadingPins}
                className="px-4 py-1.5 text-sm font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {savingPins && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Pins
              </button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
