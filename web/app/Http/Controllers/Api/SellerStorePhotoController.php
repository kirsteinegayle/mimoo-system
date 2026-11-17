<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class SellerStorePhotoController extends Controller
{
    /**
     * Upload profile photo
     */
    public function uploadProfilePhoto(Request $request)
    {
        $user = Auth::user();

        // Only sellers can upload store photos
        if ($user->account_type !== 'seller') {
            return response()->json(['error' => 'Only sellers can upload store photos'], 403);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB
        ]);

        try {
            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            // Store the uploaded file
            $file = $request->file('photo');
            $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = 'store_photos/profiles/' . $filename;
            
            // Save without resizing for now (GD extension not enabled)
            Storage::disk('public')->putFileAs('store_photos/profiles', $file, $filename);

            // Update user
            $user->profile_photo = $path;
            $user->save();

            return response()->json([
                'message' => 'Profile photo uploaded successfully',
                'photo_url' => \App\Support\AvatarUrl::fromPath($path) ?? Storage::url($path),
            ]);
        } catch (\Exception $e) {
            \Log::error('Profile photo upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id,
            ]);
            
            return response()->json([
                'error' => 'Failed to upload profile photo',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }

    /**
     * Upload cover photo
     */
    public function uploadCoverPhoto(Request $request)
    {
        $user = Auth::user();

        // Only sellers can upload store photos
        if ($user->account_type !== 'seller') {
            return response()->json(['error' => 'Only sellers can upload store photos'], 403);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB
        ]);

        try {
            // Delete old photo if exists
            if ($user->cover_photo) {
                Storage::disk('public')->delete($user->cover_photo);
            }

            // Store the uploaded file
            $file = $request->file('photo');
            $filename = 'cover_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = 'store_photos/covers/' . $filename;
            
            // Save without resizing for now (GD extension not enabled)
            Storage::disk('public')->putFileAs('store_photos/covers', $file, $filename);

            // Update user
            $user->cover_photo = $path;
            $user->save();

            return response()->json([
                'message' => 'Cover photo uploaded successfully',
                'photo_url' => Storage::url($path),
            ]);
        } catch (\Exception $e) {
            \Log::error('Cover photo upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id,
            ]);
            
            return response()->json([
                'error' => 'Failed to upload cover photo',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }

    /**
     * Delete profile photo
     */
    public function deleteProfilePhoto()
    {
        $user = Auth::user();

        if ($user->account_type !== 'seller') {
            return response()->json(['error' => 'Only sellers can manage store photos'], 403);
        }

        try {
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
                $user->profile_photo = null;
                $user->save();
            }

            return response()->json(['message' => 'Profile photo deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete profile photo',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete cover photo
     */
    public function deleteCoverPhoto()
    {
        $user = Auth::user();

        if ($user->account_type !== 'seller') {
            return response()->json(['error' => 'Only sellers can manage store photos'], 403);
        }

        try {
            if ($user->cover_photo) {
                Storage::disk('public')->delete($user->cover_photo);
                $user->cover_photo = null;
                $user->save();
            }

            return response()->json(['message' => 'Cover photo deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete cover photo',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
