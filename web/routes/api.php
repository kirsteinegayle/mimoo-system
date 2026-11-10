<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BuyerAccountController;
use App\Http\Controllers\Api\BuyerAddressController;
use App\Http\Controllers\Api\BuyerChatController;
use App\Http\Controllers\Api\BuyerFollowController;
use App\Http\Controllers\Api\BuyerNotificationController;
use App\Http\Controllers\Api\BuyerReturnController;
use App\Http\Controllers\Api\BuyerReviewController;
use App\Http\Controllers\Api\BuyerOrderController;
use App\Http\Controllers\Api\BuyerPasswordController;
use App\Http\Controllers\Api\BuyerProfileController;
use App\Http\Controllers\Api\BuyerSellerController;
use App\Http\Controllers\Api\BuyerVoucherController;
use App\Http\Controllers\Api\BuyerWishlistController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CourierAuthController;
use App\Http\Controllers\Api\CourierDashboardController;
use App\Http\Controllers\Api\CourierFacilityApiController;
use App\Http\Controllers\Api\CourierShipmentController;
use App\Http\Controllers\Api\CourierPickupController;
use App\Http\Controllers\Api\CourierScanController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1,login');

Route::prefix('buyer')->group(function () {
    // ── Auth ─────────────────────────────────────────────────────────────────
    Route::post('/login',            [AuthController::class, 'buyerLogin'])->middleware('throttle:10,1,buyer-login');
    Route::post('/register',         [AuthController::class, 'buyerRegister'])->middleware('throttle:5,1,buyer-register');
    Route::post('/verify-email',     [AuthController::class, 'buyerVerifyEmail'])->middleware('throttle:10,1,buyer-verify-email');
    Route::post('/resend-code',      [AuthController::class, 'buyerResendCode'])->middleware('throttle:3,1,buyer-resend-code');
    Route::post('/forgot-password',  [BuyerPasswordController::class, 'forgotPassword'])->middleware('throttle:5,1,buyer-forgot-password');
    Route::post('/reset-password',   [BuyerPasswordController::class, 'resetPassword'])->middleware('throttle:10,1,buyer-reset-password');

    // ── Products (public, no auth required) ──────────────────────────────────
    Route::middleware('throttle:60,1,buyer-public')->group(function () {
        Route::get('/products',                                [ProductController::class, 'index']);
        Route::get('/products/{id}',                           [ProductController::class, 'show']);
        Route::get('/products/{id}/image/{index?}',            [ProductController::class, 'image']);
        Route::get('/products/{id}/variant-image/{variantId}', [ProductController::class, 'variantImage']);
        // Seller profile (public)
        Route::get('/sellers/{id}',                            [BuyerSellerController::class, 'show'])->whereNumber('id');
        // Buyer profile photo (public serving — scoped by filename pattern)
        Route::get('/buyer/profile-photo/{filename}',          [BuyerAccountController::class, 'servePhoto']);
        // Categories (distinct, buyer-visible products)
        Route::get('/categories',                              [ProductController::class, 'categories']);
        // Seller store photos (profile | cover) with CORS
        Route::get('/seller-photo/{type}/{filename}',          [BuyerSellerController::class, 'servePhoto'])->whereIn('type', ['profile', 'cover']);
        // Reviews (public, buyer names masked)
        Route::get('/products/{id}/reviews',                   [BuyerReviewController::class, 'productReviews'])->whereNumber('id');
        // Uploaded image serving (strict filename pattern, no path traversal)
        Route::get('/review-photo/{filename}',                 [BuyerReviewController::class, 'servePhoto']);
        Route::get('/return-photo/{filename}',                 [BuyerReturnController::class, 'servePhoto']);
        Route::get('/chat-image/{filename}',                   [BuyerChatController::class, 'serveImage']);
    });

    // ── Cart + Orders + Profile (auth required) ───────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        // Profile
        Route::get('/profile',  [BuyerProfileController::class, 'show']);
        Route::put('/profile',  [BuyerProfileController::class, 'update']);

        // Account security
        Route::post('/change-password',         [BuyerAccountController::class, 'changePassword'])->middleware('throttle:10,1,buyer-change-password');
        Route::post('/change-email/request',    [BuyerAccountController::class, 'changeEmailRequest'])->middleware('throttle:5,1,buyer-change-email-request');
        Route::post('/change-email/verify',     [BuyerAccountController::class, 'changeEmailVerify'])->middleware('throttle:10,1,buyer-change-email-verify');
        Route::post('/change-phone/request',    [BuyerAccountController::class, 'changePhoneRequest'])->middleware('throttle:5,1,buyer-change-phone-request');
        Route::post('/change-phone/verify',     [BuyerAccountController::class, 'changePhoneVerify'])->middleware('throttle:10,1,buyer-change-phone-verify');
        Route::post('/profile/photo',           [BuyerAccountController::class, 'uploadPhoto'])->middleware('throttle:10,1,buyer-profile-photo');

        // Wishlist
        Route::get('/wishlist',                        [BuyerWishlistController::class, 'index']);
        Route::post('/wishlist/{productId}',           [BuyerWishlistController::class, 'store']);
        Route::delete('/wishlist/{productId}',         [BuyerWishlistController::class, 'destroy']);

        // Cart
        Route::get('/cart',              [CartController::class, 'index']);
        Route::post('/cart/items',       [CartController::class, 'addItem']);
        Route::patch('/cart/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/cart/items/{id}',[CartController::class, 'removeItem']);
        Route::delete('/cart',           [CartController::class, 'clear']);

        // Orders
        Route::post('/checkout',           [BuyerOrderController::class, 'checkout'])->middleware('throttle:10,1,buyer-checkout');
        Route::post('/checkout/preview',   [BuyerOrderController::class, 'checkoutPreview'])->middleware('throttle:60,1,buyer-checkout-preview');
        Route::get('/orders',              [BuyerOrderController::class, 'index']);
        Route::get('/orders/{id}',         [BuyerOrderController::class, 'show']);
        Route::post('/orders/{id}/cancel', [BuyerOrderController::class, 'cancel']);
        Route::post('/orders/{id}/receive', [BuyerOrderController::class, 'receive'])->middleware('throttle:10,1,buyer-order-receive')->whereNumber('id');

        // Vouchers
        Route::get('/vouchers',            [BuyerVoucherController::class, 'index']);
        Route::post('/vouchers/claim',     [BuyerVoucherController::class, 'claim'])->middleware('throttle:20,1,buyer-voucher-claim');
        Route::get('/vouchers/mine',       [BuyerVoucherController::class, 'mine']);

        // Address book
        Route::get('/addresses',                 [BuyerAddressController::class, 'index']);
        Route::post('/addresses',                [BuyerAddressController::class, 'store'])->middleware('throttle:30,1,address-store');
        Route::put('/addresses/{id}',            [BuyerAddressController::class, 'update'])->middleware('throttle:30,1,address-update')->whereNumber(['id']);
        Route::delete('/addresses/{id}',         [BuyerAddressController::class, 'destroy'])->middleware('throttle:30,1,address-destroy')->whereNumber(['id']);
        Route::post('/addresses/{id}/default',   [BuyerAddressController::class, 'setDefault'])->middleware('throttle:30,1,address-setdefault')->whereNumber(['id']);

        // Follow store
        Route::post('/sellers/{id}/follow',      [BuyerFollowController::class, 'follow'])->middleware('throttle:30,1,follow-follow')->whereNumber(['id']);
        Route::delete('/sellers/{id}/follow',    [BuyerFollowController::class, 'unfollow'])->middleware('throttle:30,1,follow-unfollow')->whereNumber(['id']);
        Route::get('/following',                 [BuyerFollowController::class, 'index']);

        // Reviews
        Route::post('/orders/{orderId}/items/{itemId}/review', [BuyerReviewController::class, 'store'])->middleware('throttle:10,1,review-store')->whereNumber(['orderId', 'itemId']);
        Route::put('/reviews/{id}',              [BuyerReviewController::class, 'update'])->middleware('throttle:10,1,review-update')->whereNumber(['id']);

        // Returns
        Route::post('/orders/{id}/return',       [BuyerReturnController::class, 'store'])->middleware('throttle:10,1,return-store')->whereNumber(['id']);
        Route::get('/returns',                   [BuyerReturnController::class, 'index']);
        Route::get('/returns/{id}',              [BuyerReturnController::class, 'show'])->whereNumber(['id']);
        Route::post('/returns/{id}/escalate',    [BuyerReturnController::class, 'escalate'])->middleware('throttle:5,1,return-escalate')->whereNumber(['id']);

        // Notifications (in-app only)
        Route::get('/notifications',             [BuyerNotificationController::class, 'index']);
        Route::post('/notifications/read-all',   [BuyerNotificationController::class, 'markAllRead'])->middleware('throttle:30,1,notification-markallread');
        Route::post('/notifications/{id}/read',  [BuyerNotificationController::class, 'markRead'])->middleware('throttle:60,1,notification-markread')->whereNumber(['id']);

        // Chat
        Route::post('/chat/start',               [BuyerChatController::class, 'start'])->middleware('throttle:20,1,chat-start');
        Route::get('/chat',                      [BuyerChatController::class, 'index']);
        Route::get('/chat/{id}/messages',        [BuyerChatController::class, 'messages'])->whereNumber(['id']);
        Route::post('/chat/{id}/messages',       [BuyerChatController::class, 'send'])->middleware('throttle:30,1,chat-send')->whereNumber(['id']);

        Route::post('/logout', [AuthController::class, 'buyerLogout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// ── Courier App (/api/courier-app/*) ─────────────────────────────────────────
// Prefix is courier-app/* (NOT courier/*) to avoid collisions with the
// existing session-auth routes in routes/web.php (/api/courier/shipments etc.)

Route::prefix('courier-app')->group(function () {
    // Public auth
    Route::post('/login',  [CourierAuthController::class, 'login'])->middleware('throttle:10,1,courier-login');

    // Authenticated routes — Sanctum token + role=courier enforced via courier.role middleware
    Route::middleware(['auth:sanctum', 'courier.role'])->group(function () {
        Route::post('/logout', [CourierAuthController::class, 'logout']);
        Route::get('/me',      [CourierAuthController::class, 'me']);

        // Dashboard
        Route::get('/dashboard', [CourierDashboardController::class, 'index']);

        // Incoming shipments
        Route::get('/shipments',              [CourierShipmentController::class, 'index']);
        Route::get('/shipments/{id}',         [CourierShipmentController::class, 'show'])->whereNumber('id');
        Route::post('/shipments/{id}/accept', [CourierShipmentController::class, 'accept'])->middleware('throttle:30,1,courier-shipment-accept')->whereNumber('id');
        Route::post('/shipments/{id}/reject', [CourierShipmentController::class, 'reject'])->middleware('throttle:30,1,courier-shipment-reject')->whereNumber('id');

        // Pickup management
        Route::get('/pickups',                          [CourierPickupController::class, 'index']);
        Route::get('/pickups/{id}',                     [CourierPickupController::class, 'show'])->whereNumber('id');
        Route::post('/pickups/{id}/schedule',           [CourierPickupController::class, 'schedule'])->middleware('throttle:30,1,courier-pickup-schedule')->whereNumber('id');
        Route::post('/pickups/{id}/assign-personnel',   [CourierPickupController::class, 'assignPersonnel'])->middleware('throttle:30,1,courier-pickup-assign')->whereNumber('id');
        Route::post('/pickups/{id}/confirm',            [CourierPickupController::class, 'confirm'])->middleware('throttle:30,1,courier-pickup-confirm')->whereNumber('id');
        Route::post('/pickups/{id}/record-failed',      [CourierPickupController::class, 'recordFailed'])->middleware('throttle:30,1,courier-pickup-failed')->whereNumber('id');
        Route::post('/pickups/{id}/reschedule',         [CourierPickupController::class, 'reschedule'])->middleware('throttle:30,1,courier-pickup-reschedule')->whereNumber('id');
        Route::post('/pickups/{id}/cancel',             [CourierPickupController::class, 'cancel'])->middleware('throttle:30,1,courier-pickup-cancel')->whereNumber('id');

        // Parcel scanning
        Route::get('/facilities',              [CourierScanController::class, 'facilities']);
        Route::get('/parcel/{waybill}',        [CourierScanController::class, 'show']);
        Route::post('/scan-parcel',            [CourierScanController::class, 'scan'])->middleware('throttle:60,1,courier-scan');

        // Facility management
        Route::post('/facilities',             [CourierFacilityApiController::class, 'store'])->middleware('throttle:20,1,courier-facility-store');
        Route::put('/facilities/{id}',         [CourierFacilityApiController::class, 'update'])->middleware('throttle:20,1,courier-facility-update')->whereNumber('id');
        Route::delete('/facilities/{id}',      [CourierFacilityApiController::class, 'destroy'])->middleware('throttle:20,1,courier-facility-delete')->whereNumber('id');
    });
});
