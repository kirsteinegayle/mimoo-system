import { alertDialog } from '@/components/app-modal';
import { Head, router } from '@inertiajs/react';
import { Copy, Eye, ImagePlus, MoreVertical, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent, ReactNode } from 'react';
import SellerShell from '@/layouts/seller/seller-shell';

interface SellerProductsProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            account_type: string;
        };
    };
    seller: {
        store_name: string;
        business_name?: string;
    };
    products: Product[];
}

const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSyne = { fontFamily: "'Syne', sans-serif" };

const PER_PAGE = 8;
const MAX_IMAGE_MB = 5;
const BORDER = 'border-[color-mix(in_srgb,#B9A6DE_44%,white)]';

// Get CSRF token for API requests
const getCsrfToken = (): string => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') || '' : '';
};

const CATEGORIES = [
    'Pet Supplies',
    'Electronics and Gadgets',
    "Women's Apparel",
    "Men's Apparel",
    'Kids and Baby',
    'Home and Garden',
    'Sports and Outdoors',
    'Health and Beauty',
    'Books and Media',
    'Food and Gourmet',
    'Furniture and Decor',
    'Jewelry and Watches',
];

type Status = 'published' | 'draft';

interface VariantOption {
    name: string;
    values: string[];
}

interface Variant {
    id: string;
    combination: Record<string, string>;
    sku: string;
    price: number;
    stock: number;
    image?: string | null;
}

interface Product {
    id: string;
    name: string;
    category: string;
    brand: string;
    desc: string;
    images: string[];
    mainIdx: number;
    price: number;
    salePrice: number | null;
    stock: number;
    sold?: number;
    sku: string;
    weight?: number | null;
    status: Status;
    approval_status?: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string | null;
    updated: number;
    has_variants?: boolean;
    variant_options?: VariantOption[];
    variants?: Variant[];
}

interface FormState {
    name: string;
    category: string;
    price: string;
    salePrice: string;
    stock: string;
    sku: string;
    weight: string;
    desc: string;
    image: string;
    has_variants: boolean;
    variant_options: VariantOption[];
    variants: Variant[];
}
type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
    name: '', category: '', price: '', salePrice: '', stock: '', sku: '', weight: '', desc: '', image: '',
    has_variants: false, variant_options: [], variants: [],
};

const peso = (n: number) =>
    '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const initials = (n: string) =>
    n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'P';

const hue = (str: string) => {
    let h = 0;
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 360;
    return h;
};

/** Shrinks the uploaded photo so it fits comfortably in localStorage. */
function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('read'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('decode'));
            img.onload = () => {
                const max = 640;
                const scale = Math.min(1, max / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('canvas'));
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    });
}

function validate(f: FormState, publish: boolean): FormErrors {
    const e: FormErrors = {};
    const price = parseFloat(f.price);
    const sale = parseFloat(f.salePrice);

    if (!f.name.trim()) e.name = 'Enter a product name.';

    if (publish) {
        if (!f.category) e.category = 'Select a category.';
        if (!f.price.trim() || isNaN(price) || price <= 0) e.price = 'Enter a price greater than 0.';
        if (f.stock.trim() === '' || !Number.isInteger(Number(f.stock)) || Number(f.stock) < 0)
            e.stock = 'Enter the stock as a whole number.';
    }

    if (f.salePrice.trim()) {
        if (isNaN(sale) || sale <= 0) e.salePrice = 'Enter a valid sale price.';
        else if (!isNaN(price) && price > 0 && sale >= price) e.salePrice = 'Sale price must be lower than the regular price.';
    }
    if (f.weight.trim() && (isNaN(parseFloat(f.weight)) || parseFloat(f.weight) <= 0)) e.weight = 'Enter a valid weight.';
    return e;
}

function Thumb({ p }: { p: Product }) {
    const src = p.images[p.mainIdx || 0];
    if (src) {
        return (
            <span className="shrink-0 w-12 h-12 rounded-[11px] overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
            </span>
        );
    }
    const h = hue(p.name);
    return (
        <span
            className="shrink-0 w-12 h-12 rounded-[11px] flex items-center justify-center text-[0.86rem] font-semibold"
            style={{
                ...fontSyne,
                background: `linear-gradient(145deg,hsl(${h} 60% 93%),hsl(${h} 50% 80%))`,
                color: `hsl(${h} 45% 28%)`,
            }}
        >
            {initials(p.name)}
        </span>
    );
}

const inputCls = (err?: string) =>
    `w-full rounded-lg border-[1.5px] px-3.5 py-2.5 text-sm text-[#2A1B4D] bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/25 focus:border-[#4B2E7E] transition ${
        err ? 'border-red-400 bg-red-50' : BORDER
    }`;

function Field({
    label, htmlFor, required, error, hint, className = '', children,
}: {
    label: string; htmlFor: string; required?: boolean; error?: string; hint?: string;
    className?: string; children: ReactNode;
}) {
    return (
        <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
            <label htmlFor={htmlFor} className="text-sm font-semibold text-[#2A1B4D]">
                {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
            </label>
            {children}
            {hint && !error && <span className="text-xs text-[#6E6570]">{hint}</span>}
            {error && <span className="text-xs font-medium text-red-600" role="alert">{error}</span>}
        </div>
    );
}

const TH = `text-left text-[0.68rem] font-semibold uppercase tracking-wide text-[#6E6570] px-4 py-3.5 border-b ${BORDER} bg-[color-mix(in_srgb,#B9A6DE_12%,white)] whitespace-nowrap`;

// ============================================================================
// Variation Helper Functions
// ============================================================================

// Generate all combinations from variant options
function generateVariantCombinations(options: VariantOption[]): Record<string, string>[] {
    if (options.length === 0) return [];
    
    const generate = (index: number, current: Record<string, string>): Record<string, string>[] => {
        if (index === options.length) return [current];
        
        const option = options[index];
        const results: Record<string, string>[] = [];
        
        for (const value of option.values) {
            results.push(...generate(index + 1, { ...current, [option.name]: value }));
        }
        
        return results;
    };
    
    return generate(0, {});
}

// Generate variant ID from combination
function generateVariantId(combination: Record<string, string>): string {
    return 'var-' + Object.values(combination).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

// Format combination for display
function formatCombination(combination: Record<string, string>): string {
    return Object.values(combination).join(' / ');
}

// ============================================================================

export default function SellerProducts({ auth, seller, products: initialProducts = [] }: SellerProductsProps) {
    const storeName = seller.store_name || seller.business_name || 'Your Store';
    
    // Use products from database (passed as props from server)
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loaded, setLoaded] = useState(false);
    const [tab, setTab] = useState<Status>('published');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [restockId, setRestockId] = useState<string | null>(null);
    const [restockAmount, setRestockAmount] = useState('');
    const [variantRestockAmounts, setVariantRestockAmounts] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [saving, setSaving] = useState(false);

    // Add / Edit modal
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [imageBusy, setImageBusy] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    
    // Variation states
    const [newOptionName, setNewOptionName] = useState('');
    const [newOptionValue, setNewOptionValue] = useState<Record<number, string>>({});
    // Variants removed one by one (most recent last) so "Undo" can put them back where they were.
    const [removedVariants, setRemovedVariants] = useState<{ variant: Variant; index: number }[]>([]);

    // Fetch products from API on mount
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/seller/products');
                if (!response.ok) throw new Error('Failed to fetch products');
                const result = await response.json();
                
                // Map API data to Product format
                const mappedProducts = (result.data || []).map((p: any) => ({
                    id: String(p.id),
                    name: p.name,
                    category: p.category || '',
                    brand: p.brand || '',
                    desc: p.description || '',
                    images: p.images || [],
                    mainIdx: p.main_image_index || 0,
                    price: parseFloat(p.price) || 0,
                    salePrice: p.sale_price ? parseFloat(p.sale_price) : null,
                    stock: p.stock || 0,
                    sold: p.sold || 0,
                    sku: p.sku || '',
                    weight: p.weight ? parseFloat(p.weight) : null,
                    status: p.status === 'active' ? 'published' as Status : 'draft' as Status,
                    approval_status: p.approval_status || 'pending',
                    rejection_reason: p.rejection_reason || null,
                    updated: p.updated_at || Date.now(),
                    has_variants: p.has_variants || false,
                    variant_options: p.variant_options || [],
                    variants: p.variants || [],
                }));
                
                setProducts(mappedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }
        
        fetchProducts();
    }, []);

    const editing = editingId ? products.find((p) => p.id === editingId) ?? null : null;

    // Load initial tab from URL
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('status') === 'draft') setTab('draft');
        setLoaded(true);
    }, []);

    // Keep ?status=draft in the URL
    useEffect(() => {
        if (!loaded) return;
        const url = new URL(window.location.href);
        if (tab === 'draft') url.searchParams.set('status', 'draft');
        else url.searchParams.delete('status');
        window.history.replaceState(window.history.state, '', url);
    }, [tab, loaded]);

    // Close row menu on outside click, Escape, scroll, resize
    useEffect(() => {
        if (!menu) return;
        const close = () => setMenu(null);
        const onClick = (e: globalThis.MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest('[data-rowmenu]') && !t.closest('[data-kebab]')) close();
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKey);
        window.addEventListener('scroll', close, { passive: true });
        window.addEventListener('resize', close);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('scroll', close);
            window.removeEventListener('resize', close);
        };
    }, [menu]);

    // Escape closes modals, and the page behind them doesn't scroll
    useEffect(() => {
        if (!formOpen && !deleteId) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (deleteId) setDeleteId(null);
            else setFormOpen(false);
        };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [formOpen, deleteId]);

    const showToast = (msg: string, bad = false) => {
        setToast({ msg, bad });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3400);
    };

    const counts = {
        published: products.filter((p) => p.status === 'published').length,
        draft: products.filter((p) => p.status === 'draft').length,
    };

    const q = query.trim().toLowerCase();
    const rows = products.filter((p) => p.status === tab && (!q || p.name.toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    const currentPage = Math.min(page, pages);
    const slice = rows.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const openMenu = (e: MouseEvent<HTMLButtonElement>, id: string) => {
        if (menu?.id === id) {
            setMenu(null);
            return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        const mw = 176;
        const mh = 140;
        let top = r.bottom + 6;
        if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 6);
        const left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw));
        setMenu({ id, top, left });
    };

    /* ---------- Add / Edit ---------- */
    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setFormOpen(true);
    };

    const openEdit = (id: string) => {
        const p = products.find((x) => x.id === id);
        setMenu(null);
        if (!p) return;
        setEditingId(id);
        setForm({
            name: p.name,
            category: p.category,
            price: p.price ? String(p.price) : '',
            salePrice: p.salePrice ? String(p.salePrice) : '',
            stock: String(p.stock),
            sku: p.sku,
            weight: p.weight ? String(p.weight) : '',
            desc: p.desc || '',
            image: p.images[p.mainIdx || 0] ?? '',
            has_variants: p.has_variants || false,
            variant_options: p.variant_options || [],
            variants: p.variants || [],
        });
        setErrors({});
        setFormOpen(true);
    };

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const pickImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrors((er) => ({ ...er, image: 'Use a JPG, PNG or WEBP image.' }));
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            setErrors((er) => ({ ...er, image: `Image is too large. Max ${MAX_IMAGE_MB}MB.` }));
            return;
        }
        setImageBusy(true);
        try {
            setField('image', await readImage(file));
        } catch {
            setErrors((er) => ({ ...er, image: 'Could not read that image. Try another one.' }));
        } finally {
            setImageBusy(false);
        }
    };

    const handleVariantImageUpload = async (e: ChangeEvent<HTMLInputElement>, variantIndex: number) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alertDialog('Please use a JPG, PNG or WEBP image.');
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            alertDialog(`Image is too large. Max ${MAX_IMAGE_MB}MB.`);
            return;
        }
        try {
            const imageDataUrl = await readImage(file);
            updateVariant(variantIndex, 'image', imageDataUrl);
        } catch {
            alertDialog('Could not read that image. Try another one.');
        }
    };

    // ========================================================================
    // Variation Handlers
    // ========================================================================

    // Toggle has_variants
    const toggleVariants = (enabled: boolean) => {
        setForm(f => ({
            ...f,
            has_variants: enabled,
            variant_options: enabled ? f.variant_options : [],
            variants: enabled ? f.variants : [],
        }));
    };

    // Add new variation option
    const addVariationOption = () => {
        if (!newOptionName.trim()) return;
        
        setForm(f => ({
            ...f,
            variant_options: [...f.variant_options, { name: newOptionName.trim(), values: [] }]
        }));
        setNewOptionName('');
    };

    // Remove variation option
    const removeVariationOption = (index: number) => {
        setForm(f => ({
            ...f,
            variant_options: f.variant_options.filter((_, i) => i !== index),
            variants: [], // Clear variants when options change
        }));
    };

    // Update option name
    const updateOptionName = (index: number, name: string) => {
        setForm(f => ({
            ...f,
            variant_options: f.variant_options.map((opt, i) => 
                i === index ? { ...opt, name } : opt
            ),
        }));
    };

    // Add value to option
    const addOptionValue = (optionIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        
        const value = newOptionValue[optionIndex]?.trim();
        if (!value) return;
        
        setForm(f => ({
            ...f,
            variant_options: f.variant_options.map((opt, i) => 
                i === optionIndex ? { ...opt, values: [...opt.values, value] } : opt
            ),
            variants: [], // Clear variants when options change
        }));
        setNewOptionValue(prev => ({ ...prev, [optionIndex]: '' }));
    };

    // Remove value from option
    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        setForm(f => ({
            ...f,
            variant_options: f.variant_options.map((opt, i) => 
                i === optionIndex ? { ...opt, values: opt.values.filter((_, vi) => vi !== valueIndex) } : opt
            ),
            variants: [], // Clear variants when options change
        }));
    };

    // Auto-generate variants from options
    const generateVariants = () => {
        if (form.variant_options.length === 0) {
            showToast('Add at least one variation option first', true);
            return;
        }
        
        const hasEmptyValues = form.variant_options.some(opt => opt.values.length === 0);
        if (hasEmptyValues) {
            showToast('Each variation option needs at least one value', true);
            return;
        }
        
        const combinations = generateVariantCombinations(form.variant_options);
        const basePrice = parseFloat(form.price) || 0;
        
        const newVariants: Variant[] = combinations.map(combination => ({
            id: generateVariantId(combination),
            combination,
            sku: '',
            price: basePrice,
            stock: 0,
        }));
        
        setRemovedVariants([]);
        setForm(f => ({ ...f, variants: newVariants }));
        showToast(`Generated ${newVariants.length} variants`);
    };

    // Update individual variant
    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        setForm(f => ({
            ...f,
            variants: f.variants.map((v, i) => 
                i === index ? { ...v, [field]: value } : v
            )
        }));
    };

    // Delete one generated variant (any row, including 0 stock) and remember it for Undo.
    const deleteVariant = (index: number) => {
        const variant = form.variants[index];
        if (!variant) return;
        setRemovedVariants(r => [...r, { variant, index }]);
        setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }));
    };

    // Restore the last removed variant at its old position.
    const undoDeleteVariant = () => {
        const last = removedVariants[removedVariants.length - 1];
        if (!last) return;
        setRemovedVariants(r => r.slice(0, -1));
        setForm(f => {
            if (f.variants.some(v => v.id === last.variant.id)) return f;
            const next = [...f.variants];
            next.splice(Math.min(last.index, next.length), 0, last.variant);
            return { ...f, variants: next };
        });
    };

    // Bulk apply price to all variants
    const bulkApplyPrice = () => {
        const price = parseFloat(form.price);
        if (isNaN(price) || price <= 0) {
            showToast('Enter a valid price first', true);
            return;
        }
        
        setForm(f => ({
            ...f,
            variants: f.variants.map(v => ({ ...v, price }))
        }));
        showToast('Price applied to all variants');
    };

    // ========================================================================

    const save = async (status: Status) => {
        const errs = validate(form, status === 'published');
        if (Object.keys(errs).length) {
            setErrors(errs);
            const first = (Object.keys(errs) as (keyof FormState)[])[0];
            setTimeout(() => document.getElementById(`pf-${first}`)?.focus(), 0);
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                description: form.desc.trim(),
                category: form.category,
                price: parseFloat(form.price) || 0,
                sale_price: form.salePrice.trim() ? parseFloat(form.salePrice) : null,
                stock: form.stock.trim() === '' ? 0 : parseInt(form.stock, 10),
                sku: form.sku.trim(),
                weight: form.weight.trim() ? parseFloat(form.weight) : null,
                status: status === 'published' ? 'active' : 'draft',
                images: form.image ? [form.image] : [],
                main_image_index: 0,
                brand: editing?.brand ?? storeName,
                has_variants: form.has_variants,
                variant_options: form.has_variants ? form.variant_options : null,
                variants: form.has_variants ? form.variants : null,
            };

            const url = editing ? `/api/products/${editing.id}` : '/api/products';
            const method = editing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to save product');
            }

            const data = await response.json();

            const savedProduct: Product = {
                id: data.product.id.toString(),
                name: data.product.name,
                category: data.product.category,
                brand: data.product.brand,
                desc: data.product.description,
                images: data.product.images ?? [],
                mainIdx: data.product.main_image_index ?? 0,
                price: data.product.price,
                salePrice: data.product.sale_price,
                stock: data.product.stock,
                sku: data.product.sku,
                weight: data.product.weight,
                status: data.product.status === 'active' ? 'published' : 'draft',
                updated: data.product.updated_at,
            };

            if (editing) {
                setProducts((list) => list.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
            } else {
                setProducts((list) => [savedProduct, ...list]);
            }

            setFormOpen(false);
            setTab(status);
            setQuery('');
            setPage(1);
            showToast(
                editing
                    ? status === 'published' ? 'Changes saved.' : 'Moved to drafts.'
                    : status === 'published' ? 'Product published.' : 'Saved as draft.',
            );
        } catch (error: any) {
            console.error('Failed to save product:', error);
            const message = error.message || 'Failed to save product. Please try again.';
            showToast(message, true);
        } finally {
            setSaving(false);
        }
    };

    /* ---------- Duplicate / Delete ---------- */
    const duplicate = (id: string) => {
        const src = products.find((p) => p.id === id);
        setMenu(null);
        if (!src) return;
        // For duplicate, we open the form with the source product data
        setEditingId(null); // Not editing, creating new
        setForm({
            name: src.name + ' (Copy)',
            category: src.category,
            price: String(src.price),
            salePrice: src.salePrice ? String(src.salePrice) : '',
            stock: String(src.stock),
            sku: src.sku ? src.sku + '-COPY' : '',
            weight: src.weight ? String(src.weight) : '',
            desc: src.desc,
            image: src.images[src.mainIdx || 0] ?? '',
            has_variants: src.has_variants || false,
            variant_options: src.variant_options || [],
            variants: src.variants || [],
        });
        setErrors({});
        setFormOpen(true);
        showToast(`Duplicating "${src.name}". Update and save as a new product.`);
    };

    const publishProduct = async (id: string) => {
        setMenu(null);
        const product = products.find(p => p.id === id);
        if (!product) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ status: 'active' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to publish product');
            }

            // Update local state
            setProducts((list) => list.map((p) => 
                p.id === id ? { ...p, status: 'published' as Status } : p
            ));
            
            showToast(`"${product.name}" published successfully!`);
        } catch (error: any) {
            console.error('Failed to publish product:', error);
            const message = error.message || 'Failed to publish product. Please try again.';
            showToast(message, true);
        }
    };

    const deleting = products.find((p) => p.id === deleteId) ?? null;

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`/api/products/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete product');
            }

            setProducts((list) => list.filter((p) => p.id !== deleteId));
            setDeleteId(null);
            showToast('Product deleted.');
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            const message = error.message || 'Failed to delete product. Please try again.';
            showToast(message, true);
        }
    };

    const menuProduct = menu ? products.find((p) => p.id === menu.id) : null;
    const publishLabel = editing?.status === 'published' ? 'Save changes' : 'Publish';
    const draftLabel = editing?.status === 'published' ? 'Move to drafts' : 'Save as draft';

    return (
        <SellerShell active="products">
            <Head title="Products" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
            `}</style>

            <div style={fontPoppins}>
                {/* Page header */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                    <div>
                        <h1 className="text-[1.7rem] font-semibold leading-tight" style={fontSyne}>Products</h1>
                        <p className="text-sm text-[#6E6570] mt-1.5 max-w-xl">
                            Published products are visible to buyers. Drafts are unfinished listings that stay hidden until you publish them.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit('/seller/products/create')}
                        className="inline-flex items-center justify-center gap-2 bg-[#4B2E7E] hover:bg-[color-mix(in_srgb,#4B2E7E_82%,black)] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>

                {/* List card */}
                <div className={`bg-white rounded-xl border-2 ${BORDER}`}>
                    {/* Tabs + search */}
                    <div className={`flex items-center justify-between gap-4 flex-wrap px-5 pt-1 border-b ${BORDER}`}>
                        <div className="flex gap-1" role="tablist" aria-label="Filter products by status">
                            {(['published', 'draft'] as Status[]).map((k) => {
                                const active = tab === k;
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => { setTab(k); setPage(1); }}
                                        className={`flex items-center gap-2 text-sm font-bold px-3.5 pt-4 pb-3.5 -mb-px border-b-[2.5px] transition ${
                                            active
                                                ? 'text-[#4B2E7E] border-[#4B2E7E]'
                                                : 'text-[#6E6570] border-transparent hover:text-[#2A1B4D]'
                                        }`}
                                    >
                                        {k === 'published' ? 'Published' : 'Draft'}
                                        <span
                                            className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${
                                                active ? 'bg-[#4B2E7E] text-white' : 'bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-[#6E6570]'
                                            }`}
                                        >
                                            {counts[k]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative my-2 w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6570]" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                                placeholder="Search products by name"
                                aria-label="Search products by name"
                                className={`w-full border-[1.5px] ${BORDER} rounded-full pl-10 pr-4 py-2.5 text-sm text-[#2A1B4D] bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#B9A6DE] focus:ring-2 focus:ring-[#4B2E7E]/25`}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {rows.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] border-collapse">
                                <thead>
                                    <tr>
                                        <th className={`${TH} pl-5`}>Product</th>
                                        <th className={`${TH} hidden md:table-cell`}>Category</th>
                                        <th className={TH}>Price</th>
                                        <th className={`${TH} hidden sm:table-cell`}>Stock</th>
                                        <th className={`${TH} hidden sm:table-cell`}>Sold</th>
                                        <th className={`${TH} hidden lg:table-cell`}>Approval</th>
                                        <th className={`${TH} w-14 pr-5`}><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slice.map((p) => {
                                        const out = p.stock <= 0;
                                        const low = !out && p.stock <= 10;
                                        const rowBorder = 'border-b border-[color-mix(in_srgb,#B9A6DE_24%,white)]';
                                        return (
                                            <tr key={p.id} className="hover:bg-[color-mix(in_srgb,#B9A6DE_12%,white)] last:[&>td]:border-b-0">
                                                <td className={`px-4 py-3.5 pl-5 ${rowBorder}`}>
                                                    <div className="flex items-center gap-3.5 min-w-[220px]">
                                                        <Thumb p={p} />
                                                        <div>
                                                            <div className="text-sm font-bold text-[#2A1B4D] leading-snug">{p.name}</div>
                                                            <div className="text-xs text-[#6E6570] mt-0.5">{p.sku || 'No SKU'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3.5 text-sm hidden md:table-cell ${rowBorder}`}>
                                                    {p.category || 'Uncategorized'}
                                                </td>
                                                <td className={`px-4 py-3.5 text-sm ${rowBorder}`}>
                                                    {p.salePrice ? (
                                                        <>
                                                            <b className="font-semibold">{peso(p.salePrice)}</b>
                                                            <s className="block text-xs text-[#6E6570]">{peso(p.price)}</s>
                                                        </>
                                                    ) : (
                                                        <b className="font-semibold">{p.price ? peso(p.price) : 'Not set'}</b>
                                                    )}
                                                </td>
                                                <td className={`px-4 py-3.5 text-sm hidden sm:table-cell ${rowBorder}`}>
                                                    <div className={`font-semibold ${out ? 'text-[#b3384f]' : low ? 'text-[#a9752b]' : ''}`}>
                                                        {p.stock}
                                                        {(out || low) && (
                                                            <small className="block text-[0.68rem] font-bold uppercase tracking-wide mt-0.5">
                                                                {out ? 'Out of stock' : 'Low stock'}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3.5 text-sm font-semibold hidden sm:table-cell ${rowBorder}`}>
                                                    {(p.sold ?? 0).toLocaleString()}
                                                </td>
                                                <td className={`px-4 py-3.5 text-sm hidden lg:table-cell ${rowBorder}`}>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            p.approval_status === 'pending'
                                                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                                : p.approval_status === 'approved'
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                        }`}
                                                        title={p.approval_status === 'rejected' && p.rejection_reason ? p.rejection_reason : undefined}
                                                    >
                                                        {p.approval_status === 'pending' && '⏳ Pending'}
                                                        {p.approval_status === 'approved' && '✓ Approved'}
                                                        {p.approval_status === 'rejected' && '✗ Rejected'}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-3.5 pr-5 text-right ${rowBorder}`}>
                                                    <button
                                                        type="button"
                                                        data-kebab
                                                        onClick={(e) => openMenu(e, p.id)}
                                                        aria-haspopup="menu"
                                                        aria-expanded={menu?.id === p.id}
                                                        aria-label={`Actions for ${p.name}`}
                                                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition ${
                                                            menu?.id === p.id
                                                                ? 'bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-[#4B2E7E]'
                                                                : 'text-[#6E6570] hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)] hover:text-[#4B2E7E]'
                                                        }`}
                                                    >
                                                        <MoreVertical className="w-[18px] h-[18px]" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 text-[#6E6570]">
                            {q ? (
                                <>
                                    <b className="block text-base text-[#2A1B4D] mb-1" style={fontSyne}>No products found</b>
                                    <span className="text-sm">Nothing matches "{query.trim()}". Try a different name.</span>
                                </>
                            ) : (
                                <>
                                    <b className="block text-base text-[#2A1B4D] mb-1" style={fontSyne}>
                                        {tab === 'draft' ? 'No drafts yet' : products.length === 0 ? 'No products yet' : 'No published products yet'}
                                    </b>
                                    <span className="text-sm">
                                        {tab === 'draft'
                                            ? 'Unfinished listings you save as a draft will appear here.'
                                            : products.length === 0
                                            ? 'Create your first product to start selling.'
                                            : 'Publish a product and it will appear here for buyers to see.'}
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Footer / pager */}
                    <div className={`flex items-center justify-between gap-4 flex-wrap px-5 py-4 border-t ${BORDER} text-[0.82rem] text-[#6E6570]`}>
                        <span>
                            {rows.length
                                ? `Showing ${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, rows.length)} of ${rows.length} product${rows.length === 1 ? '' : 's'}`
                                : '0 products'}
                        </span>
                        {pages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(currentPage - 1)}
                                    aria-label="Previous page"
                                    className={`min-w-[34px] h-[34px] px-2.5 border-[1.5px] ${BORDER} bg-white rounded-lg text-sm font-bold text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_12%,white)] disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    ‹
                                </button>
                                {Array.from({ length: pages }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setPage(i + 1)}
                                        className={`min-w-[34px] h-[34px] px-2.5 border-[1.5px] rounded-lg text-sm font-bold ${
                                            currentPage === i + 1
                                                ? 'bg-[#4B2E7E] border-[#4B2E7E] text-white'
                                                : `${BORDER} bg-white text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_12%,white)]`
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={currentPage === pages}
                                    onClick={() => setPage(currentPage + 1)}
                                    aria-label="Next page"
                                    className={`min-w-[34px] h-[34px] px-2.5 border-[1.5px] ${BORDER} bg-white rounded-lg text-sm font-bold text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_12%,white)] disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row action menu (floating so the table never clips it) */}
            {menu && menuProduct && (
                <div
                    data-rowmenu
                    role="menu"
                    aria-label="Product actions"
                    className="fixed z-[90] w-44 bg-white border-[1.5px] border-[color-mix(in_srgb,#B9A6DE_44%,white)] rounded-xl shadow-[0_14px_40px_rgba(32,26,51,0.2)] p-1.5"
                    style={{ top: menu.top, left: menu.left, ...fontPoppins }}
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setMenu(null); // Close menu
                            router.visit(`/seller/products/${menu.id}/edit`);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-left"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => duplicate(menu.id)}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-left"
                    >
                        <Copy className="w-4 h-4" />
                        Duplicate
                    </button>
                    {menuProduct && menuProduct.status === 'draft' && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => publishProduct(menu.id)}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-green-700 hover:bg-green-50 text-left"
                        >
                            <Eye className="w-4 h-4" />
                            Publish
                        </button>
                    )}
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setRestockId(menu.id); setMenu(null); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-left"
                    >
                        <Package className="w-4 h-4" />
                        Restock
                    </button>
                    <hr className="my-1.5 border-[color-mix(in_srgb,#B9A6DE_24%,white)]" />
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setDeleteId(menu.id); setMenu(null); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#b3384f] hover:bg-[#fbeced] text-left"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}

            {/* Add / Edit product modal */}
            {formOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201A33]/55 p-3 sm:p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-form-title"
                        className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-[0_24px_70px_rgba(32,26,51,0.35)]"
                        style={fontPoppins}
                    >
                        {/* Header */}
                        <div className={`flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b ${BORDER}`}>
                            <div>
                                <h3 id="product-form-title" className="text-lg font-semibold" style={fontSyne}>
                                    {editing ? 'Edit product' : 'Add product'}
                                </h3>
                                <p className="text-xs text-[#6E6570] mt-1">
                                    Fields marked <span className="text-red-600">*</span> are needed to publish. You can save a draft with just a name.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                aria-label="Close"
                                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[#6E6570] hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Photo */}
                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <span className="text-sm font-semibold text-[#2A1B4D]">Product photo</span>
                                    <div
                                        className={`flex items-center gap-4 rounded-xl p-4 ${
                                            form.image
                                                ? `border-[1.5px] ${BORDER} bg-white`
                                                : `border-2 border-dashed ${BORDER} bg-[color-mix(in_srgb,#B9A6DE_12%,white)]`
                                        }`}
                                    >
                                        <span className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-[#4B2E7E] flex items-center justify-center">
                                            {form.image ? (
                                                <img src={form.image} alt="Product preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImagePlus className="w-7 h-7" />
                                            )}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#2A1B4D]">
                                                {imageBusy ? 'Processing…' : form.image ? 'Photo added' : 'No photo yet'}
                                            </p>
                                            <p className="text-xs text-[#6E6570] mt-0.5">
                                                JPG, PNG or WEBP · up to {MAX_IMAGE_MB}MB. A clear, well-lit photo sells faster.
                                            </p>
                                            <div className="flex gap-2 mt-2.5 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => fileRef.current?.click()}
                                                    disabled={imageBusy}
                                                    className={`rounded-lg border ${BORDER} bg-white px-3.5 py-2 text-xs font-bold text-[#2A1B4D] hover:border-[#B9A6DE] hover:text-[#4B2E7E] disabled:opacity-50`}
                                                >
                                                    {form.image ? 'Change photo' : 'Upload photo'}
                                                </button>
                                                {form.image && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setField('image', '')}
                                                        className="rounded-lg px-3.5 py-2 text-xs font-bold text-[#b3384f] hover:bg-[#fbeced]"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            tabIndex={-1}
                                            className="sr-only"
                                            onChange={pickImage}
                                        />
                                    </div>
                                    {errors.image && <span className="text-xs font-medium text-red-600" role="alert">{errors.image}</span>}
                                </div>

                                <Field label="Product name" htmlFor="pf-name" required error={errors.name} className="sm:col-span-2">
                                    <input
                                        id="pf-name"
                                        autoFocus
                                        value={form.name}
                                        onChange={(e) => setField('name', e.target.value)}
                                        placeholder="e.g. Vitamin C Serum 30ml"
                                        maxLength={120}
                                        aria-invalid={!!errors.name}
                                        className={inputCls(errors.name)}
                                    />
                                </Field>

                                <Field label="Category" htmlFor="pf-category" required error={errors.category}>
                                    <select
                                        id="pf-category"
                                        value={form.category}
                                        onChange={(e) => setField('category', e.target.value)}
                                        aria-invalid={!!errors.category}
                                        className={inputCls(errors.category)}
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>

                                <Field label="SKU" htmlFor="pf-sku" hint="Your own code for tracking this item">
                                    <input
                                        id="pf-sku"
                                        value={form.sku}
                                        onChange={(e) => setField('sku', e.target.value)}
                                        placeholder="e.g. TSS-VCS-030"
                                        maxLength={40}
                                        className={inputCls()}
                                    />
                                </Field>

                                <Field label="Price (₱)" htmlFor="pf-price" required error={errors.price}>
                                    <input
                                        id="pf-price"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setField('price', e.target.value)}
                                        placeholder="0.00"
                                        aria-invalid={!!errors.price}
                                        className={inputCls(errors.price)}
                                    />
                                </Field>

                                <Field label="Sale price (₱)" htmlFor="pf-salePrice" error={errors.salePrice} hint="Optional. Leave blank if not on sale">
                                    <input
                                        id="pf-salePrice"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={form.salePrice}
                                        onChange={(e) => setField('salePrice', e.target.value)}
                                        placeholder="0.00"
                                        aria-invalid={!!errors.salePrice}
                                        className={inputCls(errors.salePrice)}
                                    />
                                </Field>

                                <Field label="Stock" htmlFor="pf-stock" required error={errors.stock} hint="Units available to sell">
                                    <input
                                        id="pf-stock"
                                        type="number"
                                        inputMode="numeric"
                                        min="0"
                                        step="1"
                                        value={form.stock}
                                        onChange={(e) => setField('stock', e.target.value)}
                                        placeholder="0"
                                        aria-invalid={!!errors.stock}
                                        className={inputCls(errors.stock)}
                                    />
                                </Field>

                                <Field label="Weight (kg)" htmlFor="pf-weight" error={errors.weight} hint="Helps logistics partners price the delivery">
                                    <input
                                        id="pf-weight"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={form.weight}
                                        onChange={(e) => setField('weight', e.target.value)}
                                        placeholder="e.g. 0.3"
                                        aria-invalid={!!errors.weight}
                                        className={inputCls(errors.weight)}
                                    />
                                </Field>

                                {/* Product Variations Section */}
                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.has_variants}
                                            onChange={(e) => toggleVariants(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#4B2E7E] focus:ring-[#4B2E7E]"
                                        />
                                        <span className="text-sm font-semibold text-[#2A1B4D]">
                                            This product has variations
                                        </span>
                                        <span className="text-xs text-[#6E6570]">(e.g., Size, Color, Material)</span>
                                    </label>
                                </div>

                                {form.has_variants && (
                                    <>
                                        {/* Variation Options Editor */}
                                        <div className="sm:col-span-2 space-y-4 p-4 rounded-xl border-2 border-dashed border-[#B9A6DE] bg-[color-mix(in_srgb,#B9A6DE_6%,white)]">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-[#2A1B4D]">Variation Options</h4>
                                                <span className="text-xs text-[#6E6570]">
                                                    {form.variant_options.length} option{form.variant_options.length !== 1 && 's'}
                                                </span>
                                            </div>

                                            {form.variant_options.map((option, optIndex) => (
                                                <div key={optIndex} className="bg-white rounded-lg p-3 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={option.name}
                                                            onChange={(e) => updateOptionName(optIndex, e.target.value)}
                                                            placeholder="e.g., Size"
                                                            className="flex-1 text-sm font-semibold border-b-2 border-transparent hover:border-[#B9A6DE] focus:border-[#4B2E7E] outline-none px-2 py-1"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariationOption(optIndex)}
                                                            className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                                                            title="Remove option"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        {option.values.map((value, valIndex) => (
                                                            <span
                                                                key={valIndex}
                                                                className="inline-flex items-center gap-1 bg-[#4B2E7E] text-white text-xs font-semibold px-2.5 py-1 rounded-full"
                                                            >
                                                                {value}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeOptionValue(optIndex, valIndex)}
                                                                    className="hover:bg-white/20 rounded-full p-0.5"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        <input
                                                            type="text"
                                                            value={newOptionValue[optIndex] || ''}
                                                            onChange={(e) => setNewOptionValue(prev => ({ ...prev, [optIndex]: e.target.value }))}
                                                            onKeyPress={(e) => addOptionValue(optIndex, e)}
                                                            placeholder="Add value (press Enter)"
                                                            className="text-xs border border-dashed border-[#B9A6DE] rounded px-2 py-1 outline-none focus:border-[#4B2E7E] min-w-[140px]"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newOptionName}
                                                    onChange={(e) => setNewOptionName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariationOption())}
                                                    placeholder="New option name (e.g., Color)"
                                                    className="flex-1 text-sm border border-[#B9A6DE] rounded-lg px-3 py-2 outline-none focus:border-[#4B2E7E]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addVariationOption}
                                                    disabled={!newOptionName.trim()}
                                                    className="bg-[#4B2E7E] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#3a2360] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Variants Table */}
                                        {form.variant_options.length > 0 && (
                                            <div className="sm:col-span-2 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-[#2A1B4D]">
                                                        Variants {form.variants.length > 0 && `(${form.variants.length})`}
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        {removedVariants.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={undoDeleteVariant}
                                                                className="text-xs font-semibold text-[#4B2E7E] hover:bg-[#F9F7FC] px-3 py-1.5 rounded border border-[#B9A6DE]"
                                                                title="Restore the last removed variant"
                                                            >
                                                                Undo remove ({removedVariants.length})
                                                            </button>
                                                        )}
                                                        {form.variants.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={bulkApplyPrice}
                                                                className="text-xs font-semibold text-[#4B2E7E] hover:bg-[#F9F7FC] px-3 py-1.5 rounded border border-[#B9A6DE]"
                                                            >
                                                                Apply price to all
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={generateVariants}
                                                            className="bg-[#4B2E7E] text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-[#3a2360]"
                                                        >
                                                            Generate variants
                                                        </button>
                                                    </div>
                                                </div>

                                                {form.variants.length === 0 ? (
                                                    <div className="text-center py-6 text-sm text-[#6E6570] border border-dashed border-[#B9A6DE] rounded-lg">
                                                        Click "Generate variants" to create all combinations
                                                    </div>
                                                ) : (
                                                    <div className="border border-[#B9A6DE] rounded-lg overflow-hidden">
                                                        <div className="overflow-x-auto max-h-[300px]">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-[color-mix(in_srgb,#B9A6DE_12%,white)] sticky top-0">
                                                                    <tr>
                                                                        <th className="text-left px-3 py-2 font-semibold text-[#2A1B4D]">Variant</th>
                                                                        <th className="text-left px-3 py-2 font-semibold text-[#2A1B4D]">Image</th>
                                                                        <th className="text-left px-3 py-2 font-semibold text-[#2A1B4D]">SKU</th>
                                                                        <th className="text-left px-3 py-2 font-semibold text-[#2A1B4D]">Price</th>
                                                                        <th className="text-left px-3 py-2 font-semibold text-[#2A1B4D]">Stock</th>
                                                                        <th className="px-3 py-2"><span className="sr-only">Delete</span></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {form.variants.map((variant, index) => (
                                                                        <tr key={variant.id} className="border-t border-[#B9A6DE]/30">
                                                                            <td className="px-3 py-2 font-medium text-[#2A1B4D]">
                                                                                {formatCombination(variant.combination)}
                                                                            </td>
                                                                            <td className="px-3 py-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    {variant.image ? (
                                                                                        <div className="relative group">
                                                                                            <img 
                                                                                                src={variant.image} 
                                                                                                alt="Variant" 
                                                                                                className="w-12 h-12 object-cover rounded border border-[#B9A6DE]"
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => updateVariant(index, 'image', null)}
                                                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                title="Remove image"
                                                                                            >
                                                                                                <X className="w-3 h-3" />
                                                                                            </button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <label className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-[#B9A6DE] rounded cursor-pointer hover:bg-[#F9F7FC] transition">
                                                                                            <input
                                                                                                type="file"
                                                                                                accept="image/*"
                                                                                                className="hidden"
                                                                                                onChange={(e) => handleVariantImageUpload(e, index)}
                                                                                            />
                                                                                            <ImagePlus className="w-4 h-4 text-[#B9A6DE]" />
                                                                                        </label>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-3 py-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={variant.sku}
                                                                                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                                                    placeholder="Optional"
                                                                                    className="w-full text-sm border border-[#B9A6DE] rounded px-2 py-1 outline-none focus:border-[#4B2E7E]"
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-2">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    value={variant.price}
                                                                                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                                                                    className="w-full text-sm border border-[#B9A6DE] rounded px-2 py-1 outline-none focus:border-[#4B2E7E]"
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-2">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="1"
                                                                                    value={variant.stock}
                                                                                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                                                                    className="w-full text-sm border border-[#B9A6DE] rounded px-2 py-1 outline-none focus:border-[#4B2E7E]"
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-2 text-right">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => deleteVariant(index)}
                                                                                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                                                                    title="Delete this variant"
                                                                                    aria-label={`Delete variant ${formatCombination(variant.combination)}`}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <Field label="Description" htmlFor="pf-desc" className="sm:col-span-2">
                                    <textarea
                                        id="pf-desc"
                                        rows={4}
                                        maxLength={500}
                                        value={form.desc}
                                        onChange={(e) => setField('desc', e.target.value)}
                                        placeholder="What is it, what's it made of, and who is it for?"
                                        className={`${inputCls()} resize-none`}
                                    />
                                    <span className="text-xs text-[#6E6570] text-right">{form.desc.length}/500</span>
                                </Field>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`flex justify-end gap-2.5 flex-wrap px-6 py-4 border-t ${BORDER} bg-[color-mix(in_srgb,#B9A6DE_12%,white)] rounded-b-2xl`}>
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#6E6570] hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => save('draft')}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold bg-white border-[1.5px] ${BORDER} text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)]`}
                            >
                                {draftLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => save('published')}
                                disabled={imageBusy || saving}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#4B2E7E] text-white hover:bg-[color-mix(in_srgb,#4B2E7E_82%,black)] disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : publishLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleting && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-[#201A33]/55 p-4"
                    onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-[0_24px_70px_rgba(32,26,51,0.35)]"
                        style={fontPoppins}
                    >
                        <h3 id="delete-title" className="text-lg font-semibold mb-1.5" style={fontSyne}>Delete this product?</h3>
                        <p className="text-sm text-[#6E6570] leading-relaxed">
                            <b className="text-[#2A1B4D]">{deleting.name}</b> will be permanently removed from your store. This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2.5 mt-6 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setDeleteId(null)}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_44%,white)]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#b3384f] text-white hover:bg-[color-mix(in_srgb,#b3384f_85%,black)]"
                            >
                                Delete product
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock modal */}
            {restockId && (() => {
                const product = products.find(p => p.id === restockId);
                if (!product) return null;
                
                const hasVariants = product.has_variants && product.variants && product.variants.length > 0;
                
                return (
                    <div
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-[#201A33]/55 p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setRestockId(null);
                                setVariantRestockAmounts({});
                            }
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="restock-title"
                            className={`relative w-full bg-white rounded-2xl p-6 shadow-[0_24px_70px_rgba(32,26,51,0.35)] ${
                                hasVariants ? 'max-w-2xl max-h-[85vh] flex flex-col' : 'max-w-md'
                            }`}
                            style={fontPoppins}
                        >
                            <div className={hasVariants ? 'mb-4' : ''}>
                                <h3 id="restock-title" className="text-lg font-semibold mb-1.5" style={fontSyne}>Restock Product</h3>
                                <p className="text-sm text-[#6E6570]">
                                    <b className="text-[#2A1B4D]">{product.name}</b>
                                </p>
                            </div>
                            
                            {hasVariants ? (
                                // Variant-based restock
                                <>
                                    <div className="flex-1 overflow-y-auto mb-4 -mx-2 px-2">
                                        <div className="space-y-3">
                                            {product.variants!.map((variant) => {
                                                const currentAmount = variantRestockAmounts[variant.id] || '';
                                                const addAmount = parseInt(currentAmount) || 0;
                                                const newStock = variant.stock + addAmount;
                                                const isLowStock = variant.stock <= 5;
                                                const isOutOfStock = variant.stock === 0;
                                                
                                                return (
                                                    <div 
                                                        key={variant.id} 
                                                        className={`border-2 rounded-xl p-4 ${
                                                            isOutOfStock 
                                                                ? 'border-red-200 bg-red-50' 
                                                                : isLowStock 
                                                                ? 'border-yellow-200 bg-yellow-50' 
                                                                : 'border-gray-200 bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                {variant.image && (
                                                                    <img 
                                                                        src={variant.image} 
                                                                        alt="" 
                                                                        className="w-12 h-12 rounded-lg object-cover shrink-0" 
                                                                    />
                                                                )}
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-bold text-[#2A1B4D]">
                                                                        {formatCombination(variant.combination)}
                                                                    </div>
                                                                    <div className="text-xs text-[#6E6570] mt-0.5">
                                                                        SKU: {variant.sku || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className={`text-sm font-bold ${
                                                                    isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-700' : 'text-[#2A1B4D]'
                                                                }`}>
                                                                    {variant.stock} units
                                                                </div>
                                                                {isOutOfStock && (
                                                                    <div className="text-[0.65rem] font-bold uppercase tracking-wide text-red-600 mt-0.5">
                                                                        Out of stock
                                                                    </div>
                                                                )}
                                                                {!isOutOfStock && isLowStock && (
                                                                    <div className="text-[0.65rem] font-bold uppercase tracking-wide text-yellow-700 mt-0.5">
                                                                        Low stock
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={currentAmount}
                                                                    onChange={(e) => setVariantRestockAmounts(prev => ({
                                                                        ...prev,
                                                                        [variant.id]: e.target.value
                                                                    }))}
                                                                    placeholder="Add units"
                                                                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-[#4B2E7E] focus:outline-none"
                                                                />
                                                            </div>
                                                            {addAmount > 0 && (
                                                                <div className="text-sm text-green-700 font-semibold shrink-0">
                                                                    → {newStock} units
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => { setRestockId(null); setVariantRestockAmounts({}); }}
                                            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_44%,white)]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const updates = Object.entries(variantRestockAmounts)
                                                    .filter(([_, amount]) => parseInt(amount) > 0)
                                                    .map(([variantId, amount]) => {
                                                        const variant = product.variants!.find(v => v.id === variantId);
                                                        return {
                                                            variantId,
                                                            newStock: variant!.stock + parseInt(amount)
                                                        };
                                                    });
                                                
                                                if (updates.length === 0) {
                                                    alertDialog('Please enter at least one amount to add');
                                                    return;
                                                }
                                                
                                                try {
                                                    // Update each variant
                                                    const promises = updates.map(({ variantId, newStock }) =>
                                                        fetch(`/api/products/${restockId}/variants/${variantId}/stock`, {
                                                            method: 'PATCH',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'X-CSRF-TOKEN': getCsrfToken(),
                                                            },
                                                            body: JSON.stringify({ stock: newStock }),
                                                        })
                                                    );
                                                    
                                                    const results = await Promise.all(promises);
                                                    
                                                    if (results.some(r => !r.ok)) {
                                                        throw new Error('Failed to update some variants');
                                                    }
                                                    
                                                    // Refresh product from API
                                                    const refreshResponse = await fetch(`/api/seller/products`);
                                                    const refreshData = await refreshResponse.json();
                                                    const mappedProducts = (refreshData.data || []).map((p: any) => ({
                                                        id: String(p.id),
                                                        name: p.name,
                                                        category: p.category || '',
                                                        brand: p.brand || '',
                                                        desc: p.description || '',
                                                        images: p.images || [],
                                                        mainIdx: p.main_image_index || 0,
                                                        price: parseFloat(p.price) || 0,
                                                        salePrice: p.sale_price ? parseFloat(p.sale_price) : null,
                                                        stock: p.stock || 0,
                                                        sku: p.sku || '',
                                                        weight: p.weight ? parseFloat(p.weight) : null,
                                                        status: p.status === 'active' ? 'published' as Status : 'draft' as Status,
                                                        updated: p.updated_at || Date.now(),
                                                        has_variants: p.has_variants || false,
                                                        variant_options: p.variant_options || [],
                                                        variants: p.variants || [],
                                                    }));
                                                    setProducts(mappedProducts);
                                                    
                                                    setRestockId(null);
                                                    setVariantRestockAmounts({});
                                                    showToast(`Restocked ${updates.length} variant${updates.length > 1 ? 's' : ''} successfully!`);
                                                } catch (error) {
                                                    console.error('Restock error:', error);
                                                    showToast('Failed to restock variants', true);
                                                }
                                            }}
                                            disabled={Object.values(variantRestockAmounts).every(v => !v || parseInt(v) <= 0)}
                                            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm Restock
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Simple product restock (no variants)
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Current Stock: <span className="text-[#4B2E7E]">{product.stock} units</span>
                                        </label>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Add Stock Amount
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={restockAmount}
                                            onChange={(e) => setRestockAmount(e.target.value)}
                                            placeholder="Enter units to add"
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 focus:border-[#4B2E7E] focus:outline-none"
                                            autoFocus
                                        />
                                        {restockAmount && parseInt(restockAmount) > 0 && (
                                            <p className="mt-2 text-sm text-green-700">
                                                New stock will be: <b>{product.stock + parseInt(restockAmount)} units</b>
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-end gap-2.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => { setRestockId(null); setRestockAmount(''); }}
                                            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_44%,white)]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const amount = parseInt(restockAmount);
                                                if (!amount || amount <= 0) {
                                                    alertDialog('Please enter a valid amount');
                                                    return;
                                                }
                                                
                                                try {
                                                    const newStock = product.stock + amount;
                                                    const response = await fetch(`/api/products/${restockId}/stock`, {
                                                        method: 'PATCH',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'X-CSRF-TOKEN': getCsrfToken(),
                                                        },
                                                        body: JSON.stringify({ stock: newStock }),
                                                    });
                                                    
                                                    if (!response.ok) throw new Error('Failed to restock');
                                                    
                                                    const data = await response.json();
                                                    
                                                    // Update local state
                                                    setProducts(prev => prev.map(p => 
                                                        p.id === restockId ? { ...p, stock: data.product.stock } : p
                                                    ));
                                                    
                                                    setRestockId(null);
                                                    setRestockAmount('');
                                                    showToast(`${product.name} restocked successfully!`);
                                                } catch (error) {
                                                    console.error('Restock error:', error);
                                                    showToast('Failed to restock product', true);
                                                }
                                            }}
                                            disabled={!restockAmount || parseInt(restockAmount) <= 0}
                                            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm Restock
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className={`fixed bottom-6 right-6 z-[120] max-w-[calc(100vw-3rem)] px-5 py-3.5 rounded-lg text-sm font-semibold text-white shadow-lg ${
                        toast.bad ? 'bg-[#b3384f]' : 'bg-[#2A1B4D]'
                    }`}
                    style={fontPoppins}
                >
                    {toast.msg}
                </div>
            )}
        </SellerShell>
    );
}

SellerProducts.layout = (page: ReactNode) => page;