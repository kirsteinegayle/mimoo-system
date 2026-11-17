import { alertDialog } from '@/components/app-modal';
import AdminShell from '@/layouts/admin/admin-shell';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Check, X, Search, Filter, Eye, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    sale_price: number | null;
    stock: number;
    sku: string;
    status: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    images: string[];
    main_image: string | null;
    brand: string;
    seller: {
        id: number;
        name: string;
        email: string;
        status?: string;
    };
    approved_by?: string;
    approved_at?: string;
    created_at: string;
}

interface ProductsResponse {
    data: Product[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats?: { total: number; pending: number; approved: number; rejected: number };
}

export default function ProductApprovalPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmApprove, setShowConfirmApprove] = useState(false);
    const [showConfirmReject, setShowConfirmReject] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

    // Wait for component to mount before making API calls
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchProducts();
        }
    }, [filter, currentPage, mounted]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                per_page: meta.per_page.toString(),
                page: currentPage.toString(),
            });

            if (filter !== 'all') {
                params.append('approval_status', filter);
            }

            if (search) {
                params.append('search', search);
            }

            console.log('Fetching products from:', `/api/admin/products?${params}`);

            const response = await fetch(`/api/admin/products?${params}`, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                
                // Try to read response as text first
                const responseText = await response.text();
                console.error('Response body:', responseText);
                
                if (response.status === 403) {
                    try {
                        const errorData = JSON.parse(responseText);
                        console.error('Admin access forbidden:', errorData);
                    } catch (e) {
                        console.error('Could not parse error as JSON');
                    }
                    alertDialog('Session expired. Please refresh the page.');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ProductsResponse = await response.json();
            console.log('Products fetched successfully:', data);
            
            setProducts(data.data || []);
            if (data.stats) setCounts(data.stats);
            setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
        } catch (error) {
            console.error('Failed to fetch products - Error details:', error);
            // Don't alert on every error, just log it
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (productId: number) => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/products/${productId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            if (response.ok) {
                fetchProducts();
                setShowModal(false);
                setShowConfirmApprove(false);
                alertDialog('Product approved successfully!');
            } else {
                const error = await response.json();
                alertDialog(error.error || 'Failed to approve product');
            }
        } catch (error) {
            console.error('Failed to approve product:', error);
            alertDialog('Failed to approve product');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (productId: number) => {
        if (!rejectionReason.trim()) {
            alertDialog('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/products/${productId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (response.ok) {
                fetchProducts();
                setShowModal(false);
                setShowConfirmReject(false);
                setRejectionReason('');
                alertDialog('Product rejected successfully!');
            } else {
                const error = await response.json();
                alertDialog(error.error || 'Failed to reject product');
            }
        } catch (error) {
            console.error('Failed to reject product:', error);
            alertDialog('Failed to reject product');
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
        setShowConfirmApprove(false);
        setShowConfirmReject(false);
        setRejectionReason('');
    };

    const stats = counts; // per-status counts come from the API (drafts excluded)

    return (
        <AdminShell active="product-approval">
            <Head title="Product Approval - Admin" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Product Approval</h1>
                <p className="mt-1 text-sm text-gray-500">Review and approve products from sellers</p>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total Products</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                            <Package className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Pending Review</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            <p className="text-xs text-gray-500">Approved</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                            <p className="text-xs text-gray-500">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filter === 'pending'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filter === 'approved'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filter === 'rejected'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        Rejected
                    </button>
                </div>

                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by product name, SKU, or seller..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                    <button
                        onClick={fetchProducts}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No products found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {product.main_image ? (
                                                <img
                                                    src={product.main_image}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.sku}</p>
                                                {product.brand && <p className="text-xs text-gray-500">Brand: {product.brand}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-900">
                                            {product.seller.name}
                                            {(product.seller.status === 'deactivated' || product.seller.status === 'suspended') && (
                                                <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-700">Seller {product.seller.status}</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">{product.seller.email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            ₱{product.sale_price ? product.sale_price.toFixed(2) : product.price.toFixed(2)}
                                        </p>
                                        {product.sale_price && (
                                            <p className="text-xs text-gray-500 line-through">₱{product.price.toFixed(2)}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-900">{product.stock} units</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                product.approval_status === 'pending'
                                                    ? 'bg-yellow-50 text-yellow-700'
                                                    : product.approval_status === 'approved'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-red-50 text-red-700'
                                            }`}
                                        >
                                            {product.approval_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-900">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => openModal(product)}
                                            className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {products.length} of {meta.total} products
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="flex items-center px-3 text-sm text-gray-700">
                            Page {currentPage} of {meta.last_page}
                        </span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === meta.last_page}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                                    <p className="mt-1 text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                                    <div className="mt-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                selectedProduct.approval_status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : selectedProduct.approval_status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {selectedProduct.approval_status === 'pending' && '⏳ Pending Review'}
                                            {selectedProduct.approval_status === 'approved' && '✓ Approved'}
                                            {selectedProduct.approval_status === 'rejected' && '✗ Rejected'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setShowConfirmApprove(false);
                                        setShowConfirmReject(false);
                                    }}
                                    className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Images */}
                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {selectedProduct.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`${selectedProduct.name} - ${idx + 1}`}
                                                className="h-40 w-full rounded-lg object-cover border-2 border-gray-200 hover:border-purple-400 transition-colors cursor-pointer"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product Details Grid */}
                            <div className="mb-6 rounded-lg bg-gray-50 p-6">
                                <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Price</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₱{selectedProduct.sale_price ? selectedProduct.sale_price.toFixed(2) : selectedProduct.price.toFixed(2)}
                                        </p>
                                        {selectedProduct.sale_price && (
                                            <p className="text-sm text-gray-500 line-through">
                                                Regular: ₱{selectedProduct.price.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Stock Available</p>
                                        <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock} units</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Category</p>
                                        <p className="text-base text-gray-900">{selectedProduct.category || 'Uncategorized'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Brand</p>
                                        <p className="text-base text-gray-900">{selectedProduct.brand || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div className="mb-6 rounded-lg border-2 border-purple-100 bg-purple-50 p-6">
                                <h3 className="mb-3 text-sm font-semibold text-purple-900 uppercase tracking-wide">Seller Information</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-lg">
                                        {selectedProduct.seller.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedProduct.seller.name}</p>
                                        <p className="text-sm text-gray-600">{selectedProduct.seller.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Description</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedProduct.description || 'No description provided by the seller.'}
                                </p>
                            </div>

                            {/* Rejection Reason if rejected */}
                            {selectedProduct.approval_status === 'rejected' && selectedProduct.rejection_reason && (
                                <div className="mb-6 rounded-lg bg-red-50 border-2 border-red-200 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                            <X className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</p>
                                            <p className="text-sm text-red-700">{selectedProduct.rejection_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        {selectedProduct.approval_status === 'pending' && (
                            <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
                                {!showConfirmApprove && !showConfirmReject && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowConfirmApprove(true)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                                        >
                                            <Check className="h-5 w-5" />
                                            Approve Product
                                        </button>
                                        <button
                                            onClick={() => setShowConfirmReject(true)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                                        >
                                            <X className="h-5 w-5" />
                                            Reject Product
                                        </button>
                                    </div>
                                )}

                                {/* Approve Confirmation */}
                                {showConfirmApprove && (
                                    <div className="rounded-lg bg-green-50 border-2 border-green-200 p-4">
                                        <div className="mb-4">
                                            <h4 className="text-lg font-bold text-green-900 mb-2">Confirm Approval</h4>
                                            <p className="text-sm text-green-700">
                                                Once approved, this product will be visible to all buyers on the platform. Are you sure you want to approve "{selectedProduct.name}"?
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(selectedProduct.id)}
                                                disabled={actionLoading}
                                                className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {actionLoading ? 'Approving...' : 'Yes, Approve'}
                                            </button>
                                            <button
                                                onClick={() => setShowConfirmApprove(false)}
                                                disabled={actionLoading}
                                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Reject Confirmation */}
                                {showConfirmReject && (
                                    <div className="rounded-lg bg-red-50 border-2 border-red-200 p-4">
                                        <div className="mb-4">
                                            <h4 className="text-lg font-bold text-red-900 mb-2">Reject Product</h4>
                                            <p className="text-sm text-red-700 mb-3">
                                                Please provide a clear reason for rejecting this product. The seller will see this message.
                                            </p>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="e.g., Images are unclear, description is incomplete, product violates guidelines..."
                                                rows={4}
                                                className="w-full rounded-lg border-2 border-red-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleReject(selectedProduct.id)}
                                                disabled={actionLoading || !rejectionReason.trim()}
                                                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowConfirmReject(false);
                                                    setRejectionReason('');
                                                }}
                                                disabled={actionLoading}
                                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedProduct.approval_status !== 'pending' && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <p className="text-center text-sm text-gray-600">
                                    This product has already been <span className="font-semibold">{selectedProduct.approval_status}</span>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
