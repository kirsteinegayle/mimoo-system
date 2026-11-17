<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Additive: operational checklist items per facility (inbound / outbound), ticked off by staff. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facility_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_facility_id')->constrained('courier_facilities')->cascadeOnDelete();
            $table->string('type', 10);               // inbound | outbound
            $table->string('title', 160);
            $table->string('note', 255)->nullable();
            $table->boolean('is_done')->default(false);
            $table->timestamp('done_at')->nullable();
            $table->string('done_by', 120)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['courier_facility_id', 'type', 'sort_order'], 'fci_facility_type_sort');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_checklist_items');
    }
};
