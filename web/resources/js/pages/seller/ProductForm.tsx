import { alertDialog } from '@/components/app-modal';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import SellerShell from '@/layouts/seller/seller-shell';

const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSyne = { fontFamily: "'Syne', sans-serif" };

const MAX_IMAGE_MB = 5;

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

interface ProductFormProps {
    product?: {
        id: string;
        name: string;
        category: string;
        brand: string;
        description: string;
        images: string[];
        mainIdx: number;
        price: number;
        salePrice: number | null;
        stock: number;
        sku: string;
        weight?: number | null;
        status: 'published' | 'draft';
        has_variants?: boolean;
        variant_options?: VariantOption[];
        variants?: Variant[];
    };
}

export default function ProductForm({ product }: ProductFormProps) {
    const isEdit = !!product;
    
    const [form, setForm] = useState({
        name: product?.name || '',
        category: product?.category || '',
        brand: product?.brand || '',
        price: product?.price?.toString() || '',
        salePrice: product?.salePrice?.toString() || '',
        stock: product?.stock?.toString() || '',
        sku: product?.sku || '',
        weight: product?.weight?.toString() || '',
        description: product?.description || '',
        status: product?.status || 'draft' as 'published' | 'draft',
        has_variants: product?.has_variants || false,
        variant_options: product?.variant_options || [],
        variants: product?.variants || [],
    });

    const [images, setImages] = useState<string[]>(product?.images || []);
    const [mainIdx, setMainIdx] = useState(product?.mainIdx || 0);
    const [saving, setSaving] = useState(false);
    // Variants removed one by one (most recent last) so "Undo" can restore them in place.
    const [removedVariants, setRemovedVariants] = useState<{ variant: Variant; index: number }[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
                alertDialog(`${file.name} is too large. Max ${MAX_IMAGE_MB}MB.`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
    };

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        if (mainIdx >= idx && mainIdx > 0) {
            setMainIdx(mainIdx - 1);
        }
    };

    const addVariantOption = () => {
        setForm(prev => ({
            ...prev,
            variant_options: [...prev.variant_options, { name: '', values: [] }]
        }));
    };

    const removeVariantOption = (idx: number) => {
        setForm(prev => ({
            ...prev,
            variant_options: prev.variant_options.filter((_, i) => i !== idx)
        }));
    };

    const updateVariantOption = (idx: number, field: 'name' | 'values', value: string | string[]) => {
        setForm(prev => ({
            ...prev,
            variant_options: prev.variant_options.map((opt, i) => 
                i === idx ? { ...opt, [field]: value } : opt
            ),
            // Clear variants when options change
            variants: []
        }));
    };

    const generateVariants = () => {
        if (form.variant_options.length === 0) {
            alertDialog('Please add at least one variant option');
            return;
        }

        // Check if all options have values
        const hasEmptyOption = form.variant_options.some(opt => !opt.name || opt.values.length === 0);
        if (hasEmptyOption) {
            alertDialog('Please fill in all option names and add values before generating variants');
            return;
        }

        const combinations: Record<string, string>[] = [];
        
        const generate = (current: Record<string, string>, depth: number) => {
            if (depth === form.variant_options.length) {
                combinations.push({ ...current });
                return;
            }
            
            const option = form.variant_options[depth];
            option.values.forEach(value => {
                const valueStr = typeof value === 'string' ? value : value;
                if (valueStr && valueStr.trim()) {
                    generate({ ...current, [option.name]: valueStr.trim() }, depth + 1);
                }
            });
        };

        generate({}, 0);

        const newVariants: Variant[] = combinations.map((combo, idx) => {
            const existing = form.variants.find(v => 
                JSON.stringify(v.combination) === JSON.stringify(combo)
            );
            
            return existing || {
                id: `var-${Date.now()}-${idx}`,
                combination: combo,
                sku: `${form.sku || 'SKU'}-${idx + 1}`,
                price: parseFloat(form.price) || 0,
                stock: 0,
                image: null,
            };
        });

        setRemovedVariants([]);
        setForm(prev => ({ ...prev, variants: newVariants }));
        alertDialog(`Generated ${newVariants.length} variants!`);
    };

    // Delete one generated variant (any row, including 0 stock) and remember it for Undo.
    const deleteVariant = (id: string) => {
        const index = form.variants.findIndex(v => v.id === id);
        if (index < 0) return;
        const variant = form.variants[index];
        setRemovedVariants(r => [...r, { variant, index }]);
        setForm(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== id) }));
    };

    // Restore the last removed variant at its old position.
    const undoDeleteVariant = () => {
        const last = removedVariants[removedVariants.length - 1];
        if (!last) return;
        setRemovedVariants(r => r.slice(0, -1));
        setForm(prev => {
            if (prev.variants.some(v => v.id === last.variant.id)) return prev;
            const next = [...prev.variants];
            next.splice(Math.min(last.index, next.length), 0, last.variant);
            return { ...prev, variants: next };
        });
    };

    const updateVariant = (id: string, field: keyof Variant, value: any) => {
        setForm(prev => ({
            ...prev,
            variants: prev.variants.map(v => 
                v.id === id ? { ...v, [field]: value } : v
            )
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = 'Product name is required';
        if (!form.category) newErrors.category = 'Category is required';
        if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required';
        if (!form.sku.trim()) newErrors.sku = 'SKU is required';
        if (images.length === 0) newErrors.images = 'At least one image is required';
        
        if (!form.has_variants && (!form.stock || parseInt(form.stock) < 0)) {
            newErrors.stock = 'Stock is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        setSaving(true);

        try {
            // Auto-calculate stock from variants if variants are enabled
            let finalStock = form.stock;
            if (form.has_variants && form.variants.length > 0) {
                finalStock = form.variants.reduce((total, variant) => total + (variant.stock || 0), 0).toString();
            }

            const payload = {
                name: form.name,
                category: form.category,
                brand: form.brand,
                description: form.description,
                price: parseFloat(form.price),
                sale_price: form.salePrice ? parseFloat(form.salePrice) : null,
                stock: form.has_variants ? parseInt(finalStock) : parseInt(form.stock),
                sku: form.sku,
                weight: form.weight ? parseFloat(form.weight) : null,
                status: form.status === 'published' ? 'active' : 'draft', // Convert published → active
                images,
                main_image_index: mainIdx,
                has_variants: form.has_variants,
                variant_options: form.has_variants ? form.variant_options : null,
                variants: form.has_variants ? form.variants : null,
            };

            const url = isEdit ? `/api/products/${product!.id}` : '/api/products';
            const method = isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save product');
            }

            // Success - redirect back to products page
            router.visit('/seller/products', {
                preserveState: false,
                preserveScroll: false,
            });
        } catch (error: any) {
            alertDialog(error.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SellerShell active="products">
            <Head title={isEdit ? 'Edit Product' : 'Add Product'} />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
            `}</style>

            <div className="max-w-5xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit('/seller/products')}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-200 text-gray-600 transition hover:border-[#4B2E7E] hover:text-[#4B2E7E]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold" style={fontSyne}>
                                {isEdit ? 'Edit Product' : 'Add New Product'}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {isEdit ? 'Update product details' : 'Fill in the details to add a new product'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-xl border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold" style={fontSyne}>Basic Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border-2 px-4 py-2.5 ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:border-[#4B2E7E] focus:outline-none`}
                                    placeholder="e.g. Premium Dog Food 5kg"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Category *</label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border-2 px-4 py-2.5 ${errors.category ? 'border-red-300' : 'border-gray-200'} focus:border-[#4B2E7E] focus:outline-none`}
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={form.brand}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 focus:border-[#4B2E7E] focus:outline-none"
                                        placeholder="e.g. Pedigree"
                                    />
                                </div>
                            </div>

                            {/* Product details (seller edits here; buyers only see them read-only on the product page) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">SKU *</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={form.sku}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border-2 px-4 py-2.5 ${errors.sku ? 'border-red-300' : 'border-gray-200'} focus:border-[#4B2E7E] focus:outline-none`}
                                        placeholder="e.g. DOG-FOOD-001"
                                    />
                                    {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={form.weight}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 focus:border-[#4B2E7E] focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 focus:border-[#4B2E7E] focus:outline-none"
                                    placeholder="Describe your product..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="rounded-xl border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold" style={fontSyne}>Product Images *</h2>
                        
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                                    <img src={img} alt="" className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => setMainIdx(idx)}
                                            className={`rounded px-2 py-1 text-xs font-bold ${mainIdx === idx ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}
                                        >
                                            {mainIdx === idx ? 'Main' : 'Set Main'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="rounded bg-red-500 p-1 text-white"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {images.length < 10 && (
                                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#4B2E7E]">
                                    <ImagePlus className="h-8 w-8 text-gray-400" />
                                    <span className="mt-2 text-xs text-gray-500">Add Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        {errors.images && <p className="mt-2 text-xs text-red-600">{errors.images}</p>}
                        <p className="mt-2 text-xs text-gray-500">Max {MAX_IMAGE_MB}MB per image. First image is the main product image.</p>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="rounded-xl border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold" style={fontSyne}>Pricing & Inventory</h2>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.has_variants}
                                    onChange={(e) => setForm(prev => ({ ...prev, has_variants: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-[#4B2E7E] focus:ring-[#4B2E7E]"
                                />
                                <span className="text-sm font-semibold text-gray-700">Enable Variants</span>
                            </label>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Price (₱) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className={`w-full rounded-lg border-2 px-4 py-2.5 ${errors.price ? 'border-red-300' : 'border-gray-200'} focus:border-[#4B2E7E] focus:outline-none`}
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Sale Price (₱)</label>
                                    <input
                                        type="number"
                                        name="salePrice"
                                        value={form.salePrice}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 focus:border-[#4B2E7E] focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>

                                {!form.has_variants && (
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-gray-700">Stock *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={form.stock}
                                            onChange={handleChange}
                                            min="0"
                                            className={`w-full rounded-lg border-2 px-4 py-2.5 ${errors.stock ? 'border-red-300' : 'border-gray-200'} focus:border-[#4B2E7E] focus:outline-none`}
                                            placeholder="0"
                                        />
                                        {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Variants Section - Matrix Combinations */}
                    {form.has_variants && (
                        <div className="rounded-xl border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] bg-white p-6">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold" style={fontSyne}>Product Variants</h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Add options like Color and Size. Each combination (e.g., Red/Small, Blue/Large) becomes a separate variant with its own stock and price.
                                </p>
                            </div>

                            {/* Variant Options */}
                            <div className="space-y-4 mb-4">
                                {form.variant_options.map((option, idx) => (
                                    <div key={idx} className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <input
                                                type="text"
                                                value={option.name}
                                                onChange={(e) => updateVariantOption(idx, 'name', e.target.value)}
                                                placeholder="Option name (e.g. Color, Size)"
                                                className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-semibold focus:border-[#4B2E7E] focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeVariantOption(idx)}
                                                className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {option.values.map((value, vIdx) => (
                                                <div key={vIdx} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={typeof value === 'string' ? value : value.name || ''}
                                                        onChange={(e) => {
                                                            const newValues = [...option.values];
                                                            newValues[vIdx] = e.target.value;
                                                            updateVariantOption(idx, 'values', newValues);
                                                        }}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const newValues = [...option.values, ''];
                                                                updateVariantOption(idx, 'values', newValues);
                                                            }
                                                        }}
                                                        placeholder="Value (press Enter to add more)"
                                                        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#4B2E7E] focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newValues = option.values.filter((_, i) => i !== vIdx);
                                                            updateVariantOption(idx, 'values', newValues);
                                                        }}
                                                        className="text-gray-400 hover:text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newValues = [...option.values, ''];
                                                updateVariantOption(idx, 'values', newValues);
                                            }}
                                            className="mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
                                        >
                                            + Add value
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={addVariantOption}
                                    className="flex items-center gap-2 rounded-lg border-2 border-[#4B2E7E] bg-white px-4 py-2 text-sm font-semibold text-[#4B2E7E] hover:bg-[#4B2E7E] hover:text-white transition"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Option
                                </button>
                                
                                {form.variant_options.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={generateVariants}
                                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                                    >
                                        Generate Variants
                                    </button>
                                )}
                            </div>

                            {/* Generated Variants Table */}
                            {form.variants.length > 0 && (
                                <div className="space-y-3">
                                    <div className="rounded-lg border-2 border-gray-200 overflow-hidden">
                                        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-700">
                                                Generated Variants ({form.variants.length})
                                            </h3>
                                            {removedVariants.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={undoDeleteVariant}
                                                    className="rounded border border-[#4B2E7E] px-3 py-1 text-xs font-semibold text-[#4B2E7E] hover:bg-[#F9F7FC]"
                                                    title="Restore the last removed variant"
                                                >
                                                    Undo remove ({removedVariants.length})
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-100 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Variant</th>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">SKU</th>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Price (₱)</th>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Stock</th>
                                                        <th className="px-4 py-2"><span className="sr-only">Delete</span></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {form.variants.map((variant) => (
                                                        <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {Object.values(variant.combination).join(' / ')}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    value={variant.sku}
                                                                    onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#4B2E7E] focus:outline-none"
                                                                    placeholder="SKU"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    value={variant.price}
                                                                    onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                                                                    step="0.01"
                                                                    min="0"
                                                                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#4B2E7E] focus:outline-none"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    value={variant.stock}
                                                                    onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                                                    min="0"
                                                                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#4B2E7E] focus:outline-none"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteVariant(variant.id)}
                                                                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                                                    title="Delete this variant"
                                                                    aria-label={`Delete variant ${Object.values(variant.combination).join(' / ')}`}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-gray-700">Status:</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-sm focus:border-[#4B2E7E] focus:outline-none"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.visit('/seller/products')}
                                className="rounded-lg border-2 border-gray-300 px-6 py-2.5 font-semibold text-gray-700 transition hover:border-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-[#4B2E7E] px-6 py-2.5 font-semibold text-white transition hover:bg-[#3B1F6B] disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </SellerShell>
    );
}
