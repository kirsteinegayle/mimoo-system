<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipmentScan extends Model
{
    protected $fillable = [
        'order_id',
        'waybill_number',
        'courier_id',
        'facility_id',
        'scan_type',
        'scanned_by',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function courier()
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function facility()
    {
        return $this->belongsTo(CourierFacility::class, 'facility_id');
    }
}
