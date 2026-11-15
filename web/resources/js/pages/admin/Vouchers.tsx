import { Head, router } from '@inertiajs/react';
import { Plus, Ticket, Calendar, DollarSign, Users, Search, Edit2, Trash2, Eye, EyeOff, X, Info } from 'lucide-react';
import { useState } from 'react';
import AdminShell from '@/layouts/admin/admin-shell';
import { toast } from 'sonner';

interface Voucher {
    id: number;
    code: string;
    name: string;
    description: string | null;
    type: 'percentage' | 'fixed';
    value: number;
    min_purchase: number;
    max_discount: number | null;
    usage_limit: number | null;
    usage_per_user: number;
    usage_count: number;
    usages_count: number;
    valid_from: string;
    valid_until: string;
    /** Same dates as "YYYY-MM-DDTHH:mm" in Philippine time, for the edit form. */
    valid_from_input?: string | null;
    valid_until_input?: string | null;
    status: 'active' | 'inactive' | 'expired';
    terms_conditions: string[] | null;
    implemented_by: string | null;
    created_at: string;
    is_valid: boolean;
}

interface Props {
    vouchers: Voucher[];
}

export default function Vouchers({ vouchers = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: '',
        min_purchase: '0',
        max_discount: '',
        usage_limit: '',
        usage_per_user: '1',
        valid_from: '',
        valid_until: '',
        status: 'active' as 'active' | 'inactive' | 'expired',
        implemented_by: '',
    });
    
    const [termsConditions, setTermsConditions] = useState<string[]>(['']);

    // Calculate stats
    const activeVouchers = vouchers.filter(v => v.status === 'active').length;
    const totalUsed = vouchers.reduce((sum, v) => sum + v.usage_count, 0);
    const totalDiscount = 0; // Would need to track from order data

    // Filter vouchers
    const filteredVouchers = vouchers.filter(v =>
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset form
    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            type: 'percentage',
            value: '',
            min_purchase: '0',
            max_discount: '',
            usage_limit: '',
            usage_per_user: '1',
            valid_from: '',
            valid_until: '',
            status: 'active',
            implemented_by: '',
        });
        setTermsConditions(['']);
    };

    // Handle create
    const handleCreate = () => {
        const data = {
            ...formData,
            terms_conditions: termsConditions.filter(t => t.trim() !== ''),
        };

        router.post('/admin/vouchers', data, {
            onSuccess: () => {
                toast.success('Voucher created successfully!');
                setShowCreateModal(false);
                resetForm();
            },
            onError: (errors) => {
                Object.values(errors).forEach((error: any) => {
                    toast.error(error);
                });
            },
        });
    };

    // Open edit modal
    const openEditModal = (voucher: Voucher) => {
        setCurrentVoucher(voucher);
        setFormData({
            code: voucher.code,
            name: voucher.name,
            description: voucher.description || '',
            type: voucher.type,
            value: voucher.value.toString(),
            min_purchase: voucher.min_purchase.toString(),
            max_discount: voucher.max_discount?.toString() || '',
            usage_limit: voucher.usage_limit?.toString() || '',
            usage_per_user: voucher.usage_per_user.toString(),
            // datetime-local needs "YYYY-MM-DDTHH:mm" (the display string left these empty).
            valid_from: voucher.valid_from_input ?? '',
            valid_until: voucher.valid_until_input ?? '',
            status: voucher.status,
            implemented_by: voucher.implemented_by || '',
        });
        setTermsConditions(voucher.terms_conditions && voucher.terms_conditions.length > 0 ? voucher.terms_conditions : ['']);
        setShowEditModal(true);
    };

    // Handle update
    const handleUpdate = () => {
        if (!currentVoucher) return;

        const data = {
            ...formData,
            terms_conditions: termsConditions.filter(t => t.trim() !== ''),
        };

        router.put(`/admin/vouchers/${currentVoucher.id}`, data, {
            onSuccess: () => {
                toast.success('Voucher updated successfully!');
                setShowEditModal(false);
                setCurrentVoucher(null);
                resetForm();
            },
            onError: (errors) => {
                Object.values(errors).forEach((error: any) => {
                    toast.error(error);
                });
            },
        });
    };

    // Handle delete
    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this voucher?')) return;

        router.delete(`/admin/vouchers/${id}`, {
            onSuccess: () => {
                toast.success('Voucher deleted successfully!');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'Failed to delete voucher');
            },
        });
    };

    // Toggle status
    const toggleStatus = (voucher: Voucher) => {
        router.patch(`/admin/vouchers/${voucher.id}/toggle`, {}, {
            onSuccess: () => {
                toast.success('Status updated!');
            },
        });
    };

    // Add T&C
    const addTermCondition = () => {
        setTermsConditions([...termsConditions, '']);
    };

    // Remove T&C
    const removeTermCondition = (index: number) => {
        setTermsConditions(termsConditions.filter((_, i) => i !== index));
    };

    // Update T&C
    const updateTermCondition = (index: number, value: string) => {
        const updated = [...termsConditions];
        updated[index] = value;
        setTermsConditions(updated);
    };

    return (
        <AdminShell active="vouchers">
            <Head title="Vouchers Management" />

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Vouchers Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Create and manage discount vouchers for your platform
                </p>
                <p className="mt-1 text-xs text-purple-600">
                    Implemented by: Admin System
                </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                            <Ticket className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Vouchers</p>
                            <p className="text-2xl font-bold text-gray-900">{vouchers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Vouchers</p>
                            <p className="text-2xl font-bold text-gray-900">{activeVouchers}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Times Used</p>
                            <p className="text-2xl font-bold text-gray-900">{totalUsed}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Discount</p>
                            <p className="text-2xl font-bold text-gray-900">₱{totalDiscount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search vouchers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>

                {/* Create Button */}
                <button 
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2D1752]"
                >
                    <Plus className="h-4 w-4" />
                    Create Voucher
                </button>
            </div>

            {/* Vouchers Table - CONTINUED IN NEXT PART */}

            {/* Vouchers Table */}
            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Discount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Usage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Valid Until
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                                <Ticket className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                                {searchQuery ? 'No vouchers found' : 'No vouchers yet'}
                                            </h3>
                                            <p className="mb-6 text-sm text-gray-500">
                                                {searchQuery ? 'Try a different search term' : 'Create your first voucher to start offering discounts'}
                                            </p>
                                            {!searchQuery && (
                                                <button 
                                                    onClick={() => {
                                                        resetForm();
                                                        setShowCreateModal(true);
                                                    }}
                                                    className="flex items-center gap-2 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2D1752]"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Create First Voucher
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredVouchers.map((voucher) => (
                                    <tr key={voucher.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{voucher.code}</p>
                                                <p className="text-sm text-gray-500">{voucher.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                voucher.type === 'percentage' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {voucher.type === 'percentage' ? 'Percentage' : 'Fixed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {voucher.type === 'percentage' 
                                                ? `${voucher.value}%` 
                                                : `₱${voucher.value.toLocaleString()}`}
                                            {voucher.max_discount && (
                                                <span className="block text-xs text-gray-500">
                                                    Max: ₱{voucher.max_discount.toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {voucher.usage_count} / {voucher.usage_limit || '∞'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {voucher.valid_until}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(voucher)}
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-colors ${
                                                    voucher.status === 'active'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : voucher.status === 'expired'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                disabled={voucher.status === 'expired'}
                                            >
                                                {voucher.status === 'active' ? (
                                                    <Eye className="h-3 w-3" />
                                                ) : (
                                                    <EyeOff className="h-3 w-3" />
                                                )}
                                                {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentVoucher(voucher);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50"
                                                    title="View Details"
                                                >
                                                    <Info className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(voucher)}
                                                    className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(voucher.id)}
                                                    className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
                                                    title="Delete"
                                                    disabled={voucher.usage_count > 0}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal - WILL BE IN NEXT PART */}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-900">Create New Voucher</h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Voucher Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="SAVE20"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Display Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Save 20% on All Items"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this voucher..."
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            {/* Discount Type & Value */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₱)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        placeholder={formData.type === 'percentage' ? '20' : '100'}
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                {formData.type === 'percentage' && (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Max Discount (₱)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.max_discount}
                                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                            placeholder="500"
                                            min="0"
                                            step="0.01"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Min Purchase & Usage */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Min Purchase (₱) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.min_purchase}
                                        onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                        placeholder="Unlimited"
                                        min="1"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Uses Per User *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usage_per_user}
                                        onChange={(e) => setFormData({ ...formData, usage_per_user: e.target.value })}
                                        placeholder="1"
                                        min="1"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            {/* Validity Period */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Valid From * <span className="font-normal text-gray-500">(Philippine time)</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Valid Until * <span className="font-normal text-gray-500">(Philippine time)</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            {/* Implemented By */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Implemented By
                                </label>
                                <input
                                    type="text"
                                    value={formData.implemented_by}
                                    onChange={(e) => setFormData({ ...formData, implemented_by: e.target.value })}
                                    placeholder="Admin Name / Department"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            {/* Terms & Conditions */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Terms & Conditions
                                    </label>
                                    <button
                                        onClick={addTermCondition}
                                        className="text-sm text-purple-600 hover:text-purple-700"
                                    >
                                        + Add Term
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {termsConditions.map((term, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={term}
                                                onChange={(e) => updateTermCondition(index, e.target.value)}
                                                placeholder={`Term ${index + 1}`}
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                            />
                                            {termsConditions.length > 1 && (
                                                <button
                                                    onClick={() => removeTermCondition(index)}
                                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2D1752]"
                                >
                                    Create Voucher
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - Similar to Create but with update logic - CONTINUED IN NEXT PART */}

            {/* Edit Modal - Same structure as Create Modal */}
            {showEditModal && currentVoucher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-900">Edit Voucher</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setCurrentVoucher(null);
                                    resetForm();
                                }}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Same form fields as Create Modal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Voucher Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Display Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Discount Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₱)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Discount Value *</label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                {formData.type === 'percentage' && (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Max Discount (₱)</label>
                                        <input
                                            type="number"
                                            value={formData.max_discount}
                                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                            min="0"
                                            step="0.01"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Min Purchase (₱) *</label>
                                    <input
                                        type="number"
                                        value={formData.min_purchase}
                                        onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                        min="1"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Uses Per User *</label>
                                    <input
                                        type="number"
                                        value={formData.usage_per_user}
                                        onChange={(e) => setFormData({ ...formData, usage_per_user: e.target.value })}
                                        min="1"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Valid From * <span className="font-normal text-gray-500">(Philippine time)</span></label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Valid Until * <span className="font-normal text-gray-500">(Philippine time)</span></label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Status *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Implemented By</label>
                                <input
                                    type="text"
                                    value={formData.implemented_by}
                                    onChange={(e) => setFormData({ ...formData, implemented_by: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-gray-700">Terms & Conditions</label>
                                    <button
                                        onClick={addTermCondition}
                                        className="text-sm text-purple-600 hover:text-purple-700"
                                    >
                                        + Add Term
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {termsConditions.map((term, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={term}
                                                onChange={(e) => updateTermCondition(index, e.target.value)}
                                                placeholder={`Term ${index + 1}`}
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                            />
                                            {termsConditions.length > 1 && (
                                                <button
                                                    onClick={() => removeTermCondition(index)}
                                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setCurrentVoucher(null);
                                        resetForm();
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2D1752]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showViewModal && currentVoucher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-900">Voucher Details</h2>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setCurrentVoucher(null);
                                }}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center">
                                <p className="text-3xl font-bold text-purple-900">{currentVoucher.code}</p>
                                <p className="mt-2 text-lg text-purple-700">{currentVoucher.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Discount</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {currentVoucher.type === 'percentage' 
                                            ? `${currentVoucher.value}%` 
                                            : `₱${currentVoucher.value.toLocaleString()}`}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Min Purchase</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        ₱{currentVoucher.min_purchase.toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Usage</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {currentVoucher.usage_count} / {currentVoucher.usage_limit || '∞'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Per User</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {currentVoucher.usage_per_user}x
                                    </p>
                                </div>
                            </div>

                            {currentVoucher.description && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Description</p>
                                    <p className="mt-1 text-sm text-gray-600">{currentVoucher.description}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-semibold text-gray-700">Validity Period</p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {currentVoucher.valid_from} to {currentVoucher.valid_until}
                                </p>
                            </div>

                            {currentVoucher.terms_conditions && currentVoucher.terms_conditions.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Terms & Conditions</p>
                                    <ul className="mt-2 space-y-1">
                                        {currentVoucher.terms_conditions.map((term, index) => (
                                            <li key={index} className="text-sm text-gray-600">
                                                • {term}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {currentVoucher.implemented_by && (
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Implemented by</p>
                                    <p className="font-semibold text-gray-900">{currentVoucher.implemented_by}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
