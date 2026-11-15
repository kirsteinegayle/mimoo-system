<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BranchAssignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Courier app "New Assign" per branch.
 *
 *   GET  /api/courier-app/branch-assign                         branches + counts
 *   GET  /api/courier-app/branch-assign/{branch}                pickups, deliveries, riders of one branch (0 = no branch)
 *   POST /api/courier-app/branch-assign/{branch}/pickups/{id}   {personnel_id}  assign pickup rider
 *   POST /api/courier-app/branch-assign/{branch}/deliveries/{orderId} {personnel_id}  assign delivery rider
 *
 * The POSTs add ONE rule on top of the existing endpoints: the item and the
 * rider must belong to that branch. Everything else (PickupAssignmentRules,
 * row locks, rider readiness, one job per order, notifications) is the
 * existing CourierPickupController / CourierDeliveryController code.
 */
class CourierBranchAssignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => BranchAssignService::summary((int) $request->user()->id)]);
    }

    public function show(Request $request, int $branch): JsonResponse
    {
        $courierId = (int) $request->user()->id;
        if (! $this->branchExists($courierId, $branch)) {
            return response()->json(['message' => 'Branch not found.'], 404);
        }

        return response()->json(['data' => BranchAssignService::queue($courierId, $branch)]);
    }

    public function assignPickup(Request $request, int $branch, int $id): JsonResponse
    {
        $request->validate(['personnel_id' => ['required', 'integer']]);
        $courierId = (int) $request->user()->id;
        if (! $this->branchExists($courierId, $branch)) {
            return response()->json(['message' => 'Branch not found.'], 404);
        }
        if (BranchAssignService::pickupBranch($courierId, $id) !== $branch) {
            return response()->json(['message' => 'This pickup is not in this branch (or is no longer open).'], 404);
        }
        if ($err = $this->riderNotInBranch($courierId, $branch, (int) $request->personnel_id)) {
            return $err;
        }

        return app(CourierPickupController::class)->assignPersonnel($request, $id);
    }

    public function assignDelivery(Request $request, int $branch, int $orderId): JsonResponse
    {
        $request->validate(['personnel_id' => ['required', 'integer']]);
        $courierId = (int) $request->user()->id;
        if (! $this->branchExists($courierId, $branch)) {
            return response()->json(['message' => 'Branch not found.'], 404);
        }
        $inBranch = collect(BranchAssignService::queue($courierId, $branch)['deliveries'])->contains('order_id', $orderId);
        if (! $inBranch) {
            return response()->json(['message' => 'This parcel is not waiting for a rider at this branch.'], 404);
        }
        if ($err = $this->riderNotInBranch($courierId, $branch, (int) $request->personnel_id)) {
            return $err;
        }
        $request->merge(['order_id' => $orderId]);

        return app(CourierDeliveryController::class)->assign($request);
    }

    private function branchExists(int $courierId, int $branch): bool
    {
        return $branch === BranchAssignService::NO_BRANCH
            || BranchAssignService::facilities($courierId)->contains('id', $branch);
    }

    /** Riders may only take work of their own branch ("No branch" work: any rider of the company). */
    private function riderNotInBranch(int $courierId, int $branch, int $personnelId): ?JsonResponse
    {
        if ($branch === BranchAssignService::NO_BRANCH) {
            return null;
        }
        $riderBranch = BranchAssignService::riderBranches($courierId)[$personnelId] ?? null;
        if ($riderBranch !== $branch) {
            return response()->json(['message' => 'This rider belongs to another branch (or has no branch). Pick a rider of this branch.'], 422);
        }

        return null;
    }
}
