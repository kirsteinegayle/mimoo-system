<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Shipping zones + weight-bracket rates (per logistics company), the shipping fee / chosen
 * logistics stored on each order, and ticket routing (target queue + related order).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('logistics_zones')) {
            Schema::create('logistics_zones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('logistics_id')->constrained('users')->cascadeOnDelete();
                $table->string('name', 80);
                $table->json('cities')->nullable();     // municipalities / cities covered
                $table->json('provinces')->nullable();  // whole provinces covered
                $table->boolean('is_default')->default(false); // preferred zone when rates tie
                $table->string('status', 10)->default('active'); // active | inactive
                $table->timestamps();
                $table->index(['logistics_id', 'status']);
            });
        }

        if (! Schema::hasTable('logistics_rates')) {
            Schema::create('logistics_rates', function (Blueprint $table) {
                $table->id();
                $table->foreignId('zone_id')->constrained('logistics_zones')->cascadeOnDelete();
                $table->decimal('min_weight', 8, 2)->default(0);   // kg, inclusive
                $table->decimal('max_weight', 8, 2)->nullable();   // kg, inclusive; null = no upper limit
                $table->decimal('fee', 10, 2);
                $table->timestamps();
                $table->index('zone_id');
            });
        }

        if (! Schema::hasColumn('orders', 'shipping_fee')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->decimal('shipping_fee', 10, 2)->default(0);
                $table->string('shipping_zone', 80)->nullable();
                $table->decimal('parcel_weight', 8, 2)->nullable();
                $table->unsignedBigInteger('logistics_id')->nullable();
                $table->string('logistics_reason', 255)->nullable();
            });
        }

        if (! Schema::hasColumn('support_tickets', 'target')) {
            Schema::table('support_tickets', function (Blueprint $table) {
                $table->string('target', 12)->default('admin'); // admin | logistics | courier
                $table->unsignedBigInteger('order_id')->nullable();
                $table->index(['target', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropIndex(['target', 'status']);
            $table->dropColumn(['target', 'order_id']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_fee', 'shipping_zone', 'parcel_weight', 'logistics_id', 'logistics_reason']);
        });
        Schema::dropIfExists('logistics_rates');
        Schema::dropIfExists('logistics_zones');
    }
};
