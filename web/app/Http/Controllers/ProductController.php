<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Admin: Get all pending products for approval.
     */
    public function adminPendingProducts(Request $request)
    {
        // Admin verification is handled by middleware, no need to check Auth::user()

        $query = Product::with(['seller:id,business_name,name,email'])
            ->where('approval_status', 'pending')
            ->orderBy('created_at', 'asc');

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q) use ($search) {
                        $q->where('business_name', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'stock' => $product->stock,
                    'sku' => $product->sku,
                    'status' => $product->status,
                    'approval_status' => $product->approval_status,
                    'images' => $product->images ?? [],
                    'main_image' => $product->main_image,
                    'brand' => $product->brand,
                    'seller' => [
                        'id' => $product->seller->id,
                        'name' => $product->seller->business_name ?? $product->seller->name,
                        'email' => $product->seller->email,
                    ],
                    'created_at' => $product->created_at->toISOString(),
                ];
            }),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Admin: Approve a product.
     */
    public function adminApproveProduct($id)
    {
        // Admin verification is handled by middleware

        $product = Product::findOrFail($id);

        // Check if already approved
        if ($product->approval_status === 'approved') {
            return response()->json(['error' => 'Product is already approved.'], 400);
        }

        try {
            DB::beginTransaction();

            $product->update([
                'approval_status' => 'approved',
                'approved_at' => now(),
                'approved_by' => null, // No user ID for session-based admin
                'rejection_reason' => null, // Clear any previous rejection reason
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Product approved successfully.',
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'approval_status' => $product->approval_status,
                    'approved_at' => $product->approved_at->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to approve product.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Reject a product.
     */
    public function adminRejectProduct(Request $request, $id)
    {
        // Admin verification is handled by middleware

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ], [
            'reason.required' => 'Rejection reason is required.',
        ]);

        $product = Product::findOrFail($id);

        try {
            DB::beginTransaction();

            $product->update([
                'approval_status' => 'rejected',
                'rejection_reason' => $validated['reason'],
                'approved_at' => null,
                'approved_by' => null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Product rejected successfully.',
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'approval_status' => $product->approval_status,
                    'rejection_reason' => $product->rejection_reason,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to reject product.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Get all products (pending, approved, rejected) with filters.
     */
    public function adminAllProducts(Request $request)
    {
        // Admin verification is handled by middleware

        $query = Product::with(['seller:id,business_name,name,email', 'approvedBy:id,name']);

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->input('approval_status'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q) use ($search) {
                        $q->where('business_name', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        
        if (in_array($sortBy, ['name', 'price', 'created_at', 'approval_status'])) {
            $query->orderBy($sortBy, $sortDir);
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'stock' => $product->stock,
                    'sku' => $product->sku,
                    'status' => $product->status,
                    'approval_status' => $product->approval_status,
                    'rejection_reason' => $product->rejection_reason,
                    'images' => $product->images ?? [],
                    'main_image' => $product->main_image,
                    'seller' => [
                        'id' => $product->seller->id,
                        'name' => $product->seller->business_name ?? $product->seller->name,
                        'email' => $product->seller->email,
                    ],
                    'approved_by' => $product->approvedBy ? $product->approvedBy->name : null,
                    'approved_at' => $product->approved_at ? $product->approved_at->toISOString() : null,
                    'created_at' => $product->created_at->toISOString(),
                ];
            }),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Display a listing of products for buyers (public).
     * Supports search, category filter, price sort, and pagination.
     */
    public function index(Request $request)
    {
        $query = Product::with('seller:id,business_name,name')
            ->where('status', 'active')
            ->where('approval_status', 'approved'); // Only show approved products to buyers

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->input('category') !== '') {
            $query->where('category', $request->input('category'));
        }

        // Sort by price
        $sortPrice = $request->input('sort_price'); // 'low_to_high' or 'high_to_low'
        if ($sortPrice === 'low_to_high') {
            $query->orderByRaw('COALESCE(sale_price, price) ASC');
        } elseif ($sortPrice === 'high_to_low') {
            $query->orderByRaw('COALESCE(sale_price, price) DESC');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'effective_price' => (float) $product->effective_price,
                    'is_on_sale' => $product->isOnSale(),
                    'stock' => $product->stock,
                    'stock_status' => $product->stock_status,
                    'is_in_stock' => $product->isInStock(),
                    'is_low_stock' => $product->isLowStock(),
                    'low_stock_threshold' => $product->low_stock_threshold ?? 5,
                    'images' => $product->images ?? [],
                    'main_image' => $product->main_image,
                    'brand' => $product->brand,
                    'seller_name' => $product->seller->business_name ?? $product->seller->name,
                ];
            }),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Display a single product for buyers.
     */
    public function show($id)
    {
        $product = Product::with('seller:id,business_name,name')
            ->findOrFail($id);

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'category' => $product->category,
            'price' => (float) $product->price,
            'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
            'effective_price' => (float) $product->effective_price,
            'is_on_sale' => $product->isOnSale(),
            'stock' => $product->stock,
            'stock_status' => $product->stock_status,
            'is_in_stock' => $product->isInStock(),
            'is_low_stock' => $product->isLowStock(),
            'images' => $product->images ?? [],
            'main_image_index' => $product->main_image_index,
            'weight' => $product->weight ? (float) $product->weight : null,
            'brand' => $product->brand,
            'sku' => $product->sku,
            'seller_name' => $product->seller->business_name ?? $product->seller->name,
            'seller_id' => $product->seller_id,
            'created_at' => $product->created_at->toISOString(),
            'updated_at' => $product->updated_at->toISOString(),
        ]);
    }

    /**
     * Display products for the authenticated seller with advanced filtering.
     * Supports search, sort, filter, and pagination.
     */
    public function sellerIndex(Request $request)
    {
        $user = Auth::user();

        // Only sellers can access this endpoint
        if ($user->account_type !== 'seller') {
            return response()->json(['error' => 'Unauthorized. Only sellers can access this endpoint.'], 403);
        }

        $query = Product::where('seller_id', $user->id);

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        
        if (in_array($sortBy, ['name', 'price', 'stock', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir);
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'stock' => $product->stock,
                    'low_stock_threshold' => $product->low_stock_threshold ?? 5,
                    'sku' => $product->sku,
                    'status' => $product->status,
                    'approval_status' => $product->approval_status ?? 'pending',
                    'rejection_reason' => $product->rejection_reason,
                    'sold' => (int) $product->sold,
                    'images' => $product->images ?? [],
                    'main_image_index' => $product->main_image_index,
                    'weight' => $product->weight ? (float) $product->weight : null,
                    'brand' => $product->brand,
                    'updated_at' => $product->updated_at->timestamp * 1000,
                    'is_low_stock' => $product->isLowStock(),
                    'is_out_of_stock' => $product->stock == 0,
                ];
            }),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Only sellers can create products
        if ($user->account_type !== 'seller') {
            return response()->json(['error' => 'Unauthorized. Only sellers can create products.'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0.01',
            'sale_price' => 'nullable|numeric|min:0.01|lt:price',
            'stock' => 'required|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'status' => ['required', Rule::in(['active', 'draft'])],
            'images' => 'nullable|array|max:5',
            'images.*' => 'string', // Base64 or URL
            'main_image_index' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0.01',
            'brand' => 'nullable|string|max:100',
            // Variant validation
            'has_variants' => 'nullable|boolean',
            'variant_options' => 'nullable|array',
            'variant_options.*.name' => 'required_with:variant_options|string|max:50',
            'variant_options.*.values' => 'required_with:variant_options|array|min:1',
            'variants' => 'nullable|array',
            'variants.*.id' => 'required_with:variants|string',
            'variants.*.combination' => 'required_with:variants|array',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'variants.*.stock' => 'required_with:variants|integer|min:0',
            'variants.*.image' => 'nullable|string',
        ], [
            'price.required' => 'Price is required.',
            'price.min' => 'Price must be greater than 0.',
            'sale_price.lt' => 'Sale price must be lower than the regular price.',
            'stock.required' => 'Stock is required.',
            'stock.integer' => 'Stock must be a whole number.',
            'stock.min' => 'Stock cannot be negative.',
            'name.required' => 'Product name is required.',
            'images.max' => 'You can upload a maximum of 5 images.',
        ]);

        try {
            DB::beginTransaction();

            // Auto-generate SKU if not provided
            if (empty($validated['sku'])) {
                $validated['sku'] = $this->generateSku();
            }

            // Set seller_id from authenticated user
            $validated['seller_id'] = $user->id;

            // Set brand to business name if not provided
            if (empty($validated['brand'])) {
                $validated['brand'] = $user->business_name ?? $user->name;
            }

            // Automatically set status to out_of_stock if stock is 0
            if ($validated['stock'] == 0 && $validated['status'] === 'active') {
                $validated['status'] = 'out_of_stock';
            }

            // Create the product
            $product = Product::create($validated);

            // Log initial stock
            StockLog::log(
                $product->id,
                $validated['stock'],
                0,
                $validated['stock'],
                'initial stock'
            );

            DB::commit();

            return response()->json([
                'message' => 'Product created successfully.',
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'stock' => $product->stock,
                    'sku' => $product->sku,
                    'status' => $product->status,
                    'images' => $product->images ?? [],
                    'main_image_index' => $product->main_image_index,
                    'weight' => $product->weight ? (float) $product->weight : null,
                    'brand' => $product->brand,
                    'updated_at' => $product->updated_at->timestamp,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create product.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $product = Product::findOrFail($id);

        // Only the product owner can update it
        if ($product->seller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized. You can only update your own products.'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
            'price' => 'sometimes|required|numeric|min:0.01',
            'sale_price' => 'nullable|numeric|min:0.01',
            'stock' => 'sometimes|required|integer|min:0',
            'sku' => 'sometimes|required|string|max:100|unique:products,sku,' . $id,
            'status' => ['sometimes', 'required', Rule::in(['active', 'draft', 'out_of_stock'])],
            'images' => 'nullable|array|max:5',
            'images.*' => 'string',
            'main_image_index' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0.01',
            'brand' => 'nullable|string|max:100',
            // Variant validation
            'has_variants' => 'nullable|boolean',
            'variant_options' => 'nullable|array',
            'variant_options.*.name' => 'required_with:variant_options|string|max:50',
            'variant_options.*.values' => 'required_with:variant_options|array|min:1',
            'variants' => 'nullable|array',
            'variants.*.id' => 'required_with:variants|string',
            'variants.*.combination' => 'required_with:variants|array',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'variants.*.stock' => 'required_with:variants|integer|min:0',
            'variants.*.image' => 'nullable|string',
        ]);

        // Validate sale_price is less than price if both are provided
        if (isset($validated['sale_price']) && isset($validated['price'])) {
            if ($validated['sale_price'] >= $validated['price']) {
                return response()->json(['error' => 'Sale price must be lower than the regular price.'], 422);
            }
        } elseif (isset($validated['sale_price']) && !isset($validated['price'])) {
            if ($validated['sale_price'] >= $product->price) {
                return response()->json(['error' => 'Sale price must be lower than the regular price.'], 422);
            }
        }

        try {
            DB::beginTransaction();

            $oldStock = $product->stock;

            // Update product
            $product->update($validated);

            // Log stock change if stock was updated
            if (isset($validated['stock']) && $validated['stock'] !== $oldStock) {
                StockLog::log(
                    $product->id,
                    $validated['stock'] - $oldStock,
                    $oldStock,
                    $validated['stock'],
                    'manual adjustment'
                );
            }

            // Automatically set status to out_of_stock if stock is 0
            if ($product->stock == 0 && $product->status === 'active') {
                $product->update(['status' => 'out_of_stock']);
            } elseif ($product->stock > 0 && $product->status === 'out_of_stock' && isset($validated['status']) && $validated['status'] === 'active') {
                // Allow reactivating if stock is replenished
                $product->update(['status' => 'active']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Product updated successfully.',
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'stock' => $product->stock,
                    'sku' => $product->sku,
                    'status' => $product->status,
                    'images' => $product->images ?? [],
                    'main_image_index' => $product->main_image_index,
                    'weight' => $product->weight ? (float) $product->weight : null,
                    'brand' => $product->brand,
                    'updated_at' => $product->updated_at->timestamp,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update product.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update only the stock for a product.
     */
    public function updateStock(Request $request, $id)
    {
        $user = Auth::user();
        $product = Product::findOrFail($id);

        // Only the product owner can update it
        if ($product->seller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized. You can only update your own products.'], 403);
        }

        // Validate stock
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ], [
            'stock.required' => 'Stock is required.',
            'stock.integer' => 'Stock must be a whole number.',
            'stock.min' => 'Stock cannot be negative.',
        ]);

        try {
            DB::beginTransaction();

            $oldStock = $product->stock;
            $newStock = $validated['stock'];

            // Update stock
            $product->update(['stock' => $newStock]);

            // Log the change
            StockLog::log(
                $product->id,
                $newStock - $oldStock,
                $oldStock,
                $newStock,
                'manual edit',
                (string) $user->id
            );

            // Auto-update status based on stock
            if ($newStock == 0 && $product->status === 'active') {
                $product->update(['status' => 'out_of_stock']);
            } elseif ($newStock > 0 && $product->status === 'out_of_stock') {
                $product->update(['status' => 'active']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Stock updated successfully.',
                'product' => [
                    'id' => $product->id,
                    'stock' => $product->stock,
                    'status' => $product->status,
                    'is_low_stock' => $product->isLowStock(),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update stock.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update stock for a specific variant.
     */
    public function updateVariantStock(Request $request, $productId, $variantId)
    {
        $user = Auth::user();
        $product = Product::findOrFail($productId);

        // Only the product owner can update it
        if ($product->seller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized. You can only update your own products.'], 403);
        }

        // Validate stock
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ], [
            'stock.required' => 'Stock is required.',
            'stock.integer' => 'Stock must be a whole number.',
            'stock.min' => 'Stock cannot be negative.',
        ]);

        try {
            DB::beginTransaction();

            // Get current variants
            $variants = $product->variants ?? [];
            
            // Find and update the specific variant
            $variantFound = false;
            $oldStock = 0;
            foreach ($variants as $index => $variant) {
                if ($variant['id'] === $variantId) {
                    $oldStock = $variant['stock'] ?? 0;
                    $variants[$index]['stock'] = $validated['stock'];
                    $variantFound = true;
                    break;
                }
            }

            if (!$variantFound) {
                return response()->json(['error' => 'Variant not found.'], 404);
            }

            // Update product with new variants
            $product->update(['variants' => $variants]);

            // Recalculate total stock from all variants
            $totalStock = array_sum(array_column($variants, 'stock'));
            $product->update(['stock' => $totalStock]);

            // Log the change
            StockLog::log(
                $product->id,
                $validated['stock'] - $oldStock,
                $oldStock,
                $validated['stock'],
                "variant restock: {$variantId}",
                (string) $user->id
            );

            // Auto-update status based on total stock
            if ($totalStock == 0 && $product->status === 'active') {
                $product->update(['status' => 'out_of_stock']);
            } elseif ($totalStock > 0 && $product->status === 'out_of_stock') {
                $product->update(['status' => 'active']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Variant stock updated successfully.',
                'variant' => [
                    'id' => $variantId,
                    'stock' => $validated['stock'],
                ],
                'product' => [
                    'id' => $product->id,
                    'total_stock' => $totalStock,
                    'status' => $product->status,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update variant stock.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get stock logs for a product.
     */
    public function getStockLogs($id)
    {
        $user = Auth::user();
        $product = Product::findOrFail($id);

        // Only the product owner can view logs
        if ($product->seller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $logs = StockLog::where('product_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'change' => $log->change,
                    'old_stock' => $log->old_stock,
                    'new_stock' => $log->new_stock,
                    'reason' => $log->reason,
                    'reference_id' => $log->reference_id,
                    'created_at' => $log->created_at->toISOString(),
                ];
            });

        return response()->json($logs);
    }

    /**
     * Remove the specified product (soft delete).
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $product = Product::findOrFail($id);

        // Only the product owner can delete it
        if ($product->seller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized. You can only delete your own products.'], 403);
        }

        $product->delete(); // Soft delete thanks to SoftDeletes trait

        return response()->json(['message' => 'Product archived successfully.']);
    }

    /**
     * Generate a unique SKU.
     */
    private function generateSku(): string
    {
        do {
            $sku = 'SKU-' . strtoupper(Str::random(8));
        } while (Product::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Buyer: Report a product.
     */
    public function reportProduct(Request $request, $id)
    {
        $user = Auth::user();
        $product = Product::findOrFail($id);

        // Same rules as the buyer mobile API (ProductReportService); web response shape unchanged.
        $validated = $request->validate(
            \App\Services\ProductReportService::rules(),
            \App\Services\ProductReportService::messages()
        );

        $result = \App\Services\ProductReportService::submit($user, $product, $validated);

        if ($result['error'] === \App\Services\ProductReportService::ERR_DUPLICATE) {
            return response()->json(['error' => 'You have already reported this product.'], 400);
        }
        if ($result['error'] === \App\Services\ProductReportService::ERR_OWN) {
            return response()->json(['error' => 'You cannot report your own product.'], 400);
        }

        $report = $result['report'];

        return response()->json([
            'message' => 'Product reported successfully. Our team will review it shortly.',
            'report' => [
                'id' => $report->id,
                'reason' => $report->reason,
                'status' => $report->status,
            ],
        ], 201);
    }

    /**
     * Admin: Get all product reports.
     */
    public function adminGetReports(Request $request)
    {
        $query = \App\Models\ProductReport::with(['product.seller:id,business_name,name', 'reporter:id,name,email'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
        $reports = $query->paginate($perPage);

        return response()->json([
            'data' => $reports->map(function ($report) {
                return [
                    'id' => $report->id,
                    'product' => $report->product ? [
                        'id' => $report->product->id,
                        'name' => $report->product->name,
                        'description' => $report->product->description,
                        'price' => (float) $report->product->price,
                        'sku' => $report->product->sku,
                        'images' => $report->product->images ?? [],
                        'main_image' => $report->product->main_image,
                        'seller' => [
                            'id' => $report->product->seller->id,
                            'name' => $report->product->seller->business_name ?? $report->product->seller->name,
                            'email' => $report->product->seller->email,
                        ],
                    ] : null,
                    'reporter' => [
                        'id' => $report->reporter->id,
                        'name' => $report->reporter->name,
                        'email' => $report->reporter->email,
                    ],
                    'reason' => $report->reason,
                    'description' => $report->description,
                    'status' => $report->status,
                    'admin_notes' => $report->admin_notes,
                    'reviewed_at' => $report->reviewed_at ? $report->reviewed_at->toISOString() : null,
                    'created_at' => $report->created_at->toISOString(),
                ];
            }),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    /**
     * Admin: Approve a report (delete the product).
     */
    public function adminApproveReport(Request $request, $id)
    {
        $report = \App\Models\ProductReport::with('product')->findOrFail($id);

        if ($report->status !== 'pending') {
            return response()->json(['error' => 'This report has already been reviewed.'], 400);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            // Update report status
            $report->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'admin_notes' => $validated['notes'] ?? null,
            ]);

            // Delete the product (soft delete)
            $reportedProduct = $report->product;
            if ($report->product) {
                $report->product->delete();
            }

            // Reporter + seller notifications (inserted after commit; no reporter identity to the seller).
            \App\Services\ProductReportNotificationService::reviewed($report, $reportedProduct);

            DB::commit();

            return response()->json([
                'message' => 'Report approved and product removed successfully.',
                'report' => [
                    'id' => $report->id,
                    'status' => $report->status,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to approve report.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Reject a report (keep the product).
     */
    public function adminRejectReport(Request $request, $id)
    {
        $report = \App\Models\ProductReport::findOrFail($id);

        if ($report->status !== 'pending') {
            return response()->json(['error' => 'This report has already been reviewed.'], 400);
        }

        $validated = $request->validate([
            'notes' => 'required|string|max:500',
        ], [
            'notes.required' => 'Please provide a reason for rejecting this report.',
        ]);

        try {
            DB::beginTransaction();

            $report->update([
                'status' => 'rejected',
                'reviewed_at' => now(),
                'admin_notes' => $validated['notes'],
            ]);

            // Reporter notification only (product kept, so nothing to the seller).
            \App\Services\ProductReportNotificationService::reviewed($report, $report->product);

            DB::commit();

            return response()->json([
                'message' => 'Report rejected successfully.',
                'report' => [
                    'id' => $report->id,
                    'status' => $report->status,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to reject report.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get seller store data with products and stats.
     */
    public function getSellerStore(Request $request, $id)
    {
        $seller = \App\Models\User::where('id', $id)
            ->where('account_type', 'seller')
            ->firstOrFail();

        // Get seller's active products
        $query = Product::where('seller_id', $id)
            ->where('status', 'active')
            ->where('approval_status', 'approved');

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        
        if ($sortBy === 'price') {
            $query->orderByRaw('COALESCE(sale_price, price) ' . $sortDir);
        } elseif (in_array($sortBy, ['name', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir);
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
        $products = $query->paginate($perPage);

        // Calculate stats
        $totalProducts = Product::where('seller_id', $id)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->count();

        $totalSold = \App\Models\OrderItem::whereHas('product', function ($q) use ($id) {
            $q->where('seller_id', $id);
        })->whereHas('order', function ($q) {
            $q->where('status', '!=', 'cancelled')
                ->where('status', '!=', 'failed');
        })->sum('quantity');

        $followers = \App\Models\SellerFollow::where('seller_id', $id)->count();

        // Real rating of this seller's items (reviews of order items sold by the seller).
        $reviewRows = \App\Models\Review::whereHas('orderItem', fn ($q) => $q->where('seller_id', $id));
        $totalReviews = (clone $reviewRows)->count();
        $rating = $totalReviews > 0 ? round((float) (clone $reviewRows)->avg('rating'), 1) : 0.0;

        // Calculate account age in years
        $accountAge = $seller->created_at->diffInYears(now());

        return response()->json([
            'products' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'effective_price' => (float) ($product->sale_price ?? $product->price),
                    'is_on_sale' => $product->sale_price !== null,
                    'stock' => $product->stock,
                    'stock_status' => $product->stock_status,
                    'is_in_stock' => $product->stock > 0,
                    'images' => $product->images ?? [],
                    'main_image' => $product->main_image,
                    'brand' => $product->brand,
                ];
            }),
            'stats' => [
                'products' => $totalProducts,
                'sold' => $totalSold,
                'followers' => $followers,
                'rating' => $rating,
                'total_reviews' => $totalReviews,
                'account_age_years' => $accountAge,
                'verified' => $seller->verification_status === 'verified',
            ],
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

}
