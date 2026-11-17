<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReport;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminBugFixesTest extends TestCase
{
    use DatabaseTransactions;

    private function seller(array $o = []): User
    {
        return User::factory()->create($o + ['account_type' => 'seller', 'role' => 'seller', 'status' => 'approved', 'verification_status' => 'verified']);
    }

    private function buyer(): User
    {
        return User::factory()->create(['account_type' => 'buyer', 'role' => 'buyer', 'status' => 'approved', 'verification_status' => 'verified']);
    }

    private function product(User $seller, array $o = []): Product
    {
        static $n = 0;
        $n++;

        return Product::create($o + [
            'seller_id' => $seller->id, 'name' => "Prod {$n}", 'price' => 100, 'stock' => 5, 'sku' => "SKU-{$n}",
            'status' => 'active', 'approval_status' => 'approved', 'brand' => 'Acme',
        ]);
    }

    private function admin(): static
    {
        return $this->withSession(['admin_verified' => true]);
    }

    public function test_admin_product_list_has_brand_hides_drafts_and_counts_every_status(): void
    {
        $s = $this->seller();
        $this->product($s, ['approval_status' => 'pending']);
        $this->product($s, ['approval_status' => 'pending', 'status' => 'draft']); // draft: seller only
        $this->product($s, ['approval_status' => 'approved']);
        $this->product($s, ['approval_status' => 'rejected']);

        $res = $this->admin()->getJson('/api/admin/products?approval_status=pending')->assertOk();
        $res->assertJsonCount(1, 'data');
        $this->assertSame('Acme', $res->json('data.0.brand'));
        $this->assertSame(['total' => 3, 'pending' => 1, 'approved' => 1, 'rejected' => 1], $res->json('stats'));

        $this->admin()->getJson('/api/admin/products/pending')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_approved_report_still_lists_with_removed_product(): void
    {
        $s = $this->seller();
        $p = $this->product($s);
        $r = ProductReport::create(['product_id' => $p->id, 'reported_by' => $this->buyer()->id, 'reason' => 'spam', 'description' => 'x', 'status' => 'approved']);
        $p->delete();

        $res = $this->admin()->getJson('/api/admin/reports')->assertOk();
        $this->assertTrue($res->json('data.0.product.removed'));
        $this->assertNull($res->json('data.0.product.url'));
        $this->assertSame(1, $res->json('stats.approved'));
    }

    public function test_deactivated_seller_products_are_hidden_from_buyers(): void
    {
        $s = $this->seller();
        $p = $this->product($s);
        $this->getJson('/api/products')->assertJsonCount(1, 'data');
        $this->get('/product/' . $p->id)->assertOk();

        $s->forceFill(['status' => 'deactivated', 'status_reason' => 'x'])->save();

        $this->getJson('/api/products')->assertJsonCount(0, 'data');
        $this->getJson('/api/products/' . $p->id)->assertNotFound();
        $this->get('/product/' . $p->id)->assertNotFound();
        $this->get('/seller/' . $s->id)->assertNotFound();
        $this->getJson('/api/seller/' . $s->id . '/store')->assertNotFound();

        // admin still sees it, labelled with the seller status
        $res = $this->admin()->getJson('/api/admin/products')->assertOk();
        $this->assertSame('deactivated', $res->json('data.0.seller.status'));
    }

    public function test_buy_now_does_not_touch_the_cart(): void
    {
        $s = $this->seller();
        $inCart = $this->product($s);
        $direct = $this->product($s);
        $b = $this->buyer();
        $cart = Cart::create(['buyer_id' => $b->id]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $inCart->id, 'quantity' => 2]);

        $this->actingAs($b)->get('/checkout?buy_now=1&product_id=' . $direct->id . '&quantity=3')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Checkout')
                ->where('buyNow.product_id', $direct->id)
                ->where('buyNow.quantity', 3)
                ->has('cartItems', 1));

        $this->assertSame(1, CartItem::count());

        $this->actingAs($b)->postJson('/api/orders', [
            'payment_method' => 'cod', 'shipping_name' => 'A', 'shipping_address' => 'B', 'shipping_phone' => '09171234567',
            'buy_now' => ['product_id' => $direct->id, 'quantity' => 3],
        ])->assertCreated();

        $this->assertSame(1, CartItem::count(), 'cart item must stay');
        $this->assertSame($inCart->id, CartItem::first()->product_id);
        $this->assertSame(2, (int) $direct->fresh()->stock);
        $this->assertSame(1, Order::count());
    }

    public function test_approval_status_logs_in_only_the_remembered_pending_seller(): void
    {
        $seller = $this->seller(['status' => 'pending']);

        // unknown browser: nothing happens
        $this->getJson('/register/approval-status')->assertJson(['state' => 'unknown']);
        $this->assertGuest();

        $this->withSession(['pending_approval_user_id' => $seller->id])
            ->getJson('/register/approval-status')->assertJson(['state' => 'pending']);
        $this->assertGuest();

        $seller->forceFill(['status' => 'approved'])->save();
        $this->withSession(['pending_approval_user_id' => $seller->id])
            ->getJson('/register/approval-status')->assertJson(['state' => 'approved', 'redirect' => '/seller/dashboard']);
        $this->assertAuthenticatedAs($seller);
    }

    public function test_abandoned_registration_can_be_retried_and_errors_are_specific(): void
    {
        $old = User::factory()->create([
            'account_type' => 'buyer', 'role' => 'buyer', 'status' => 'pending', 'verification_status' => 'unverified',
            'email' => 'abandoned@example.com', 'contact_number' => '09171230000', 'email_verified_at' => null,
            'password' => 'Str0ng!Passw0rd#1',
        ]);

        $payload = [
            'first_name' => 'Juan', 'last_name' => 'Cruz', 'sex' => 'male', 'birthday' => '1990-01-01',
            'email' => 'abandoned@example.com', 'contact_number' => '09171230000', 'account_type' => 'buyer',
            'region' => 'NCR', 'municipality_city' => 'Manila', 'barangay' => 'B1', 'street_address' => '1 St',
            'terms_accepted' => '1', 'password' => 'Str0ng!Passw0rd#1', 'password_confirmation' => 'Str0ng!Passw0rd#1',
            'id_document' => \Illuminate\Http\UploadedFile::fake()->create('id.pdf', 10, 'application/pdf'),
        ];

        // same person retrying: allowed, old half-created row replaced
        $this->post('/register', $payload)->assertSessionHasNoErrors();
        $this->assertSame(1, User::where('email', 'abandoned@example.com')->count());
        $this->assertNotSame($old->id, User::where('email', 'abandoned@example.com')->value('id'));

        // a VERIFIED account is never removed; message names the field
        User::where('email', 'abandoned@example.com')->update(['email_verified_at' => now(), 'verification_status' => 'verified']);
        $payload['id_document'] = \Illuminate\Http\UploadedFile::fake()->create('id.pdf', 10, 'application/pdf');
        $this->post('/register', $payload)->assertSessionHasErrors([
            'email' => 'Email is already registered. Please log in or contact support.',
        ]);
    }
}
