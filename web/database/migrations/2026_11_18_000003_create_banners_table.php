<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Homepage banners managed by the admin (hero carousel, secondary and sidebar slots), with a schedule. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title', 120);
            $table->string('image', 255);            // /storage/banners/... (uploaded) or /images/... (bundled)
            $table->string('link_url', 255)->nullable();
            $table->string('position', 12);          // hero | secondary | sidebar
            $table->string('status', 10)->default('active'); // active | inactive
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
            $table->index(['position', 'status', 'sort_order']);
        });

        // The banners that were hardcoded on the buyer homepage, so nothing disappears.
        $now = now();
        foreach ([
            ['Main promo banner 1', '/images/main banner 1.jpg', '/category/Pet%20Supplies', 'hero', 1],
            ['Main promo banner 2', '/images/main banner 2.jpg', '/category/Electronics%20and%20Gadgets', 'hero', 2],
            ['Perfume & Makeup Offers', '/images/perfumes banner.jpg', '/category/Health%20and%20Beauty', 'secondary', 1],
            ['iPhone & Electronics Sale', '/images/phones banner.jpg', '/category/Electronics%20and%20Gadgets', 'secondary', 2],
            ['Payday Sale Promo', '/images/payday sale.png', '/homepage', 'sidebar', 1],
            ['Special Sale Banner', '/images/sale banner.jpg', '/homepage', 'sidebar', 2],
        ] as [$title, $image, $link, $position, $order]) {
            DB::table('banners')->insert([
                'title' => $title, 'image' => $image, 'link_url' => $link, 'position' => $position,
                'status' => 'active', 'sort_order' => $order, 'created_at' => $now, 'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
