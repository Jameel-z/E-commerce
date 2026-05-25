"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { apiClient } from "@/lib/api";
import type { Banner, BannerPosition } from "@/lib/api";
import { getImageUrl } from "@/shared/utils/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  X,
  Check,
  ImageIcon,
  Video,
  Loader2,
} from "lucide-react";

// ─── Inline form state ───────────────────────────────────────────────────────

interface FormState {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  text_position: BannerPosition;
  hide_overlay: boolean;
  is_active: boolean;
  file: File | null;
  preview: string | null;
  fileSize: number;
  dimensions: { w: number; h: number } | null;
}

const EMPTY_FORM: FormState = {
  title: "",
  subtitle: "",
  cta_text: "",
  cta_link: "",
  text_position: "middle-center",
  hide_overlay: false,
  is_active: true,
  file: null,
  preview: null,
  fileSize: 0,
  dimensions: null,
};

// ─── Position overlay (invisible 3×3 zones on the image) ─────────────────────

const POSITIONS: BannerPosition[] = [
  "top-left",    "top-center",    "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

const POSITION_LABELS: Record<BannerPosition, string> = {
  "top-left": "Top left", "top-center": "Top center", "top-right": "Top right",
  "middle-left": "Mid left", "middle-center": "Center", "middle-right": "Mid right",
  "bottom-left": "Bot left", "bottom-center": "Bot center", "bottom-right": "Bot right",
};

// absolute position of the floating indicator inside the image container
const INDICATOR_CSS: Record<BannerPosition, string> = {
  "top-left":      "top-3 left-3",
  "top-center":    "top-3 left-1/2 -translate-x-1/2",
  "top-right":     "top-3 right-3",
  "middle-left":   "top-1/2 -translate-y-1/2 left-3",
  "middle-center": "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2",
  "middle-right":  "top-1/2 -translate-y-1/2 right-3",
  "bottom-left":   "bottom-3 left-3",
  "bottom-center": "bottom-3 left-1/2 -translate-x-1/2",
  "bottom-right":  "bottom-3 right-3",
};

// text alignment for the indicator lines
const INDICATOR_ALIGN: Record<BannerPosition, string> = {
  "top-left": "items-start", "top-center": "items-center", "top-right": "items-end",
  "middle-left": "items-start", "middle-center": "items-center", "middle-right": "items-end",
  "bottom-left": "items-start", "bottom-center": "items-center", "bottom-right": "items-end",
};

/**
 * Invisible 3×3 clickable zone grid overlaid on the image.
 * Render inside a `relative` container that already shows the image.
 */
function PositionOverlay({
  value,
  onChange,
}: {
  value: BannerPosition;
  onChange: (p: BannerPosition) => void;
}) {
  return (
    <>
      {/* 9 invisible clickable zones */}
      <div className="absolute inset-0 z-10 grid grid-cols-3 grid-rows-3">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            title={POSITION_LABELS[pos]}
            onClick={() => onChange(pos)}
            className={`transition-colors duration-100 ${
              value === pos ? "bg-black/10" : "hover:bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Floating indicator at the active position */}
      <div
        className={`absolute z-20 pointer-events-none flex flex-col gap-[3px] ${INDICATOR_CSS[value]} ${INDICATOR_ALIGN[value]}`}
      >
        <div className="h-[3px] w-8 rounded-full bg-white shadow drop-shadow-md" />
        <div className="h-[3px] w-5 rounded-full bg-white/75 shadow" />
        <div className="h-[5px] w-7 rounded bg-white/50 shadow mt-0.5" />
      </div>
    </>
  );
}

/**
 * Full media + position-picker card.
 * Shows the image/video (or a placeholder) and overlays the invisible zone grid.
 */
function MediaWithPosition({
  preview,
  file,
  dimensions,
  position,
  onPositionChange,
  onRemove,
  onPickFile,
}: {
  preview: string | null;
  file: File | null;
  dimensions: { w: number; h: number } | null;
  position: BannerPosition;
  onPositionChange: (p: BannerPosition) => void;
  onRemove: () => void;
  onPickFile: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground block">
        {preview ? "Click image to set content position" : "Media file (image or video) *"}
      </label>

      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
        {/* Background */}
        {preview ? (
          file?.type.startsWith("video") ? (
            <video src={preview} className="absolute inset-0 w-full h-full object-cover" muted />
          ) : (
            <img src={preview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" draggable={false} />
          )
        ) : (
          /* Placeholder when no file chosen */
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-7 w-7 opacity-40" />
            <span className="text-xs opacity-60">Upload to preview</span>
          </div>
        )}

        {/* Invisible position zones overlay — always visible */}
        <PositionOverlay value={position} onChange={onPositionChange} />

        {/* Remove / pick file button — z-30 so it's above zones */}
        {preview ? (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onPickFile}
            className="absolute inset-0 z-30 w-full h-full cursor-pointer"
            aria-label="Upload file"
          />
        )}

        {/* Dimensions badge */}
        {dimensions && (
          <div className="absolute bottom-2 left-2 z-30 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded pointer-events-none">
            {dimensions.w} × {dimensions.h} px
          </div>
        )}
      </div>

      {/* Scale bar + hints */}
      {file ? (
        <>
          <ScaleBar file={file} />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Recommended: <strong>1920 × 600 px</strong>
            </p>
            <button
              type="button"
              onClick={onPickFile}
              className="text-[10px] text-primary underline underline-offset-2 hover:opacity-80"
            >
              Replace file
            </button>
          </div>
        </>
      ) : (
        <p className="text-[10px] text-muted-foreground">
          JPEG · PNG · WebP up to <strong>5 MB</strong> &nbsp;|&nbsp; MP4 · WebM up to <strong>50 MB</strong>
          &nbsp;·&nbsp; Recommended: <strong>1920 × 600 px</strong>
        </p>
      )}

      <p className="text-[10px] text-muted-foreground">
        Content position: <span className="font-medium text-foreground">{POSITION_LABELS[position]}</span>
      </p>
    </div>
  );
}

const IMAGE_MAX = 5 * 1024 * 1024;   // 5 MB
const VIDEO_MAX = 50 * 1024 * 1024;  // 50 MB

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function ScaleBar({ file }: { file: File }) {
  const isVideo = file.type.startsWith("video");
  const max = isVideo ? VIDEO_MAX : IMAGE_MAX;
  const pct = Math.min((file.size / max) * 100, 100);
  const over = file.size > max;
  const color = over
    ? "bg-destructive"
    : pct > 85
    ? "bg-yellow-500"
    : "bg-green-500";

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-[11px] font-medium">
        <span className={over ? "text-destructive" : "text-muted-foreground"}>
          {fmtBytes(file.size)}
          {over && " — exceeds limit!"}
        </span>
        <span className="text-muted-foreground">max {isVideo ? "50 MB" : "5 MB"}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Small helper components ─────────────────────────────────────────────────

function MediaThumb({ banner }: { banner: Banner }) {
  const url = getImageUrl(banner.media_url);
  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <ImageIcon className="h-6 w-6" />
      </div>
    );
  }
  if (banner.media_type === "video") {
    return (
      <video
        src={url}
        className="w-full h-full object-cover"
        muted
        preload="metadata"
      />
    );
  }
  return (
    <img src={url} alt={banner.title ?? "Banner"} className="w-full h-full object-cover" />
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Sortable banner row ─────────────────────────────────────────────────────

interface SortableRowProps {
  banner: Banner;
  isEditing: boolean;
  form: FormState;
  saving: boolean;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

function SortableBannerRow({
  banner, isEditing, form, saving, setForm,
  onEdit, onCancelEdit, onUpdate, onToggle, onDelete,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`transition-shadow ${
          isEditing ? "ring-2 ring-primary shadow-md" : isDragging ? "shadow-lg" : "hover:shadow-sm"
        }`}
      >
        <CardContent className="p-4">
          {isEditing ? (
            /* ── Edit mode ─────────────────────────────────────────── */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Edit Banner</h3>
                <button onClick={onCancelEdit} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Banner image + invisible position overlay */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                <MediaThumb banner={banner} />
                <PositionOverlay
                  value={form.text_position}
                  onChange={(p) => setForm((f) => ({ ...f, text_position: p }))}
                />
              </div>
              <p className="text-[10px] text-muted-foreground -mt-1">
                Click image to set content position ·{" "}
                <span className="font-medium text-foreground">{POSITION_LABELS[form.text_position]}</span>
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <TextInput
                  label="Headline"
                  value={form.title}
                  onChange={(v) => setForm((f) => ({ ...f, title: v }))}
                  placeholder="e.g. Shop the Latest Tech"
                />
                <TextInput
                  label="Subtitle"
                  value={form.subtitle}
                  onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))}
                  placeholder="e.g. Exclusive deals every week"
                />
                <TextInput
                  label="Button text"
                  value={form.cta_text}
                  onChange={(v) => setForm((f) => ({ ...f, cta_text: v }))}
                  placeholder="e.g. Shop Now"
                />
                <TextInput
                  label="Button link"
                  value={form.cta_link}
                  onChange={(v) => setForm((f) => ({ ...f, cta_link: v }))}
                  placeholder="e.g. /products"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`active-${banner.id}`}
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor={`active-${banner.id}`} className="text-sm text-muted-foreground">
                    Active (visible on homepage)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`hide-overlay-${banner.id}`}
                    checked={form.hide_overlay}
                    onChange={(e) => setForm((f) => ({ ...f, hide_overlay: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor={`hide-overlay-${banner.id}`} className="text-sm text-muted-foreground">
                    Image only — hide text overlay (image has its own design)
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={onUpdate} disabled={saving} size="sm">
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Save Changes
                </Button>
                <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* ── View mode ─────────────────────────────────────────── */
            <div className="flex gap-3 items-start">
              {/* Drag handle */}
              <button
                {...attributes}
                {...listeners}
                className="mt-1 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </button>

              {/* Thumbnail */}
              <div className="shrink-0 w-28 sm:w-36 aspect-video rounded-lg overflow-hidden border border-border bg-muted relative">
                <MediaThumb banner={banner} />
                {banner.media_type === "video" && (
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white rounded px-1 py-0.5 flex items-center gap-0.5">
                    <Video className="h-2.5 w-2.5" />
                    <span className="text-[9px] font-medium">VIDEO</span>
                  </div>
                )}
              </div>

              {/* Info + actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm truncate">
                      {banner.title || <span className="text-muted-foreground italic">No title</span>}
                    </p>
                    {banner.subtitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{banner.subtitle}</p>
                    )}
                    {banner.cta_text && banner.cta_link && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Button: <span className="font-medium">{banner.cta_text}</span>{" "}
                        <span className="opacity-60">→ {banner.cta_link}</span>
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      banner.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {banner.is_active ? "Active" : "Hidden"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={onEdit}>
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>

                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={onToggle}>
                    {banner.is_active ? (
                      <><EyeOff className="h-3.5 w-3.5 mr-1" />Hide</>
                    ) : (
                      <><Eye className="h-3.5 w-3.5 mr-1" />Show</>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-2.5 text-xs ml-auto"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Which banner is being edited (null = none, "new" = new banner form open)
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getAdminBanners();
      setBanners(data);
    } catch {
      setError("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── File picker ──────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, file, preview, fileSize: file.size, dimensions: null }));

    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
        setForm((f) => ({ ...f, dimensions: { w: img.naturalWidth, h: img.naturalHeight } }));
        URL.revokeObjectURL(img.src);
      };
      img.src = preview;
    }
  };

  // ── Open edit form for existing banner ───────────────────────────────────

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      cta_text: banner.cta_text ?? "",
      cta_link: banner.cta_link ?? "",
      text_position: banner.text_position ?? "middle-center",
      hide_overlay: banner.hide_overlay ?? false,
      is_active: banner.is_active,
      file: null,
      preview: null,
      fileSize: 0,
      dimensions: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    if (form.preview) URL.revokeObjectURL(form.preview);
  };

  // ── Save new banner ──────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.file) {
      setError("Please select an image or video file.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("media", form.file);
      fd.append("title", form.title);
      fd.append("subtitle", form.subtitle);
      fd.append("cta_text", form.cta_text);
      fd.append("cta_link", form.cta_link);
      fd.append("text_position", form.text_position);
      fd.append("hide_overlay", String(form.hide_overlay));
      fd.append("is_active", String(form.is_active));
      fd.append("display_order", String(banners.length));
      const created = await apiClient.createBanner(fd);
      setBanners((prev) => [...prev, created]);
      cancelEdit();
    } catch (e: any) {
      setError(e.message || "Failed to create banner.");
    } finally {
      setSaving(false);
    }
  };

  // ── Save edits to existing banner ────────────────────────────────────────

  const handleUpdate = async (banner: Banner) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiClient.updateBanner(banner.id, {
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        cta_text: form.cta_text || undefined,
        cta_link: form.cta_link || undefined,
        text_position: form.text_position,
        hide_overlay: form.hide_overlay,
        is_active: form.is_active,
      });
      setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      cancelEdit();
    } catch (e: any) {
      setError(e.message || "Failed to update banner.");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ────────────────────────────────────────────────────────

  const toggleActive = async (banner: Banner) => {
    try {
      const updated = await apiClient.updateBanner(banner.id, {
        is_active: !banner.is_active,
      });
      setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch {
      setError("Failed to update banner.");
    }
  };

  // ── Drag-and-drop sensors ─────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = banners.findIndex((b) => b.id === active.id);
    const newIdx = banners.findIndex((b) => b.id === over.id);
    const next = arrayMove(banners, oldIdx, newIdx);
    setBanners(next);

    try {
      await Promise.all(
        next.map((b, i) => apiClient.updateBanner(b.id, { display_order: i }))
      );
    } catch {
      setError("Failed to save order.");
      load();
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this banner? This cannot be undone.")) return;
    try {
      await apiClient.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Failed to delete banner.");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout title="Banner Slider">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Banner Slider">
      <div className="space-y-6">
        {/* Page description + add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground max-w-lg">
            Manage the full-width banner slides shown at the top of the homepage.
            Upload images or videos, set headline text, and control display order.
          </p>
          {editingId !== "new" && (
            <Button
              onClick={() => {
                setEditingId("new");
                setForm(EMPTY_FORM);
              }}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── New banner form ─────────────────────────────────────────────── */}
        {editingId === "new" && (
          <Card className="border-primary/40 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">New Banner</h3>
                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Media preview + invisible position overlay */}
              <MediaWithPosition
                preview={form.preview}
                file={form.file}
                dimensions={form.dimensions}
                position={form.text_position}
                onPositionChange={(p) => setForm((f) => ({ ...f, text_position: p }))}
                onRemove={() => setForm((f) => ({ ...f, file: null, preview: null, fileSize: 0, dimensions: null }))}
                onPickFile={() => fileInputRef.current?.click()}
              />

              {/* Text fields */}
              <div className="grid sm:grid-cols-2 gap-3">
                <TextInput
                  label="Headline"
                  value={form.title}
                  onChange={(v) => setForm((f) => ({ ...f, title: v }))}
                  placeholder="e.g. Shop the Latest Tech"
                />
                <TextInput
                  label="Subtitle"
                  value={form.subtitle}
                  onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))}
                  placeholder="e.g. Exclusive deals every week"
                />
                <TextInput
                  label="Button text"
                  value={form.cta_text}
                  onChange={(v) => setForm((f) => ({ ...f, cta_text: v }))}
                  placeholder="e.g. Shop Now"
                />
                <TextInput
                  label="Button link"
                  value={form.cta_link}
                  onChange={(v) => setForm((f) => ({ ...f, cta_link: v }))}
                  placeholder="e.g. /products"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="new-active"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="new-active" className="text-sm text-muted-foreground">
                    Active (visible on homepage)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="new-hide-overlay"
                    checked={form.hide_overlay}
                    onChange={(e) => setForm((f) => ({ ...f, hide_overlay: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="new-hide-overlay" className="text-sm text-muted-foreground">
                    Image only — hide text overlay (image has its own design)
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving || !form.file} size="sm">
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Save Banner
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Banner list ─────────────────────────────────────────────────── */}
        {banners.length === 0 && editingId !== "new" ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No banners yet</p>
            <p className="text-sm mt-1">Click "Add Banner" to upload your first slide.</p>
          </div>
        ) : (
          <>
            {banners.length > 1 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <GripVertical className="h-3.5 w-3.5" />
                Drag the grip handle to reorder slides
              </p>
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {banners.map((banner) => (
                    <SortableBannerRow
                      key={banner.id}
                      banner={banner}
                      isEditing={editingId === banner.id}
                      form={form}
                      saving={saving}
                      setForm={setForm}
                      onEdit={() => openEdit(banner)}
                      onCancelEdit={cancelEdit}
                      onUpdate={() => handleUpdate(banner)}
                      onToggle={() => toggleActive(banner)}
                      onDelete={() => handleDelete(banner.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {banners.length} banner{banners.length !== 1 ? "s" : ""} total &nbsp;·&nbsp;{" "}
          {banners.filter((b) => b.is_active).length} active
        </p>
      </div>
    </AdminLayout>
  );
}
