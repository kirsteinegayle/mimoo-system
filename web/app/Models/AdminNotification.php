<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** In-app notification for the shared admin team (see AdminNotificationService). */
class AdminNotification extends Model
{
    protected $fillable = ['type', 'title', 'body', 'link', 'source_key', 'read_at'];

    protected $casts = ['read_at' => 'datetime'];
}
