<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

/**
 * Base controller for /api/courier-app/* authenticated endpoints.
 *
 * Role enforcement is handled at the route level via the 'courier.role'
 * middleware (EnsureCourierRole) — NOT in the constructor, since Laravel 11
 * removed constructor-based $this->middleware() from controllers.
 */
class CourierBaseController extends Controller
{
    // intentionally empty — role guard is on the route group in api.php
}
