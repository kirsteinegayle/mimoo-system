<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailVerification;
use App\Models\User;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    /**
     * Show the email verification page
     */
    public function showVerification(Request $request): Response
    {
        $email = $request->query('email');
        
        return Inertia::render('auth/VerifyEmail', [
            'email' => $email,
        ]);
    }
    
    /**
     * Verify the OTP code
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ], [
            'code.size' => 'Verification code must be exactly 6 digits.',
            'code.regex' => 'Verification code must be exactly 6 digits.',
        ]);
        
        $verification = EmailVerification::findValid($request->email, $request->code);
        
        if (!$verification) {
            // Check if there's an expired code
            $expired = EmailVerification::where('email', $request->email)
                ->where('code', $request->code)
                ->where('verified', false)
                ->first();
            
            if ($expired && $expired->isExpired()) {
                return back()->withErrors([
                    'code' => 'Code expired. Please request a new code.',
                ]);
            }
            
            return back()->withErrors([
                'code' => 'Invalid verification code.',
            ]);
        }
        
        // Mark verification as used
        $verification->update(['verified' => true]);
        
        // Update user status to verified
        $user = User::where('email', $request->email)->first();
        
        if ($user) {
            $user->update([
                'verification_status' => 'verified',
                'email_verified_at' => now(),
            ]);
            
            // Email proven in this browser: let the pending page sign them in once the admin approves.
            \App\Http\Controllers\Auth\ApprovalStatusController::remember($request, $user);

            // Redirect based on account type
            if ($user->account_type === 'seller') {
                // Sellers need admin approval
                return redirect()->route('seller.pending-approval')
                    ->with('status', 'Email verified! Your account is pending admin approval.');
            }
            
            if ($user->account_type === 'logistics') {
                // Logistics need admin approval
                return redirect()->route('logistics.pending-approval')
                    ->with('status', 'Email verified! Your account is pending admin approval.');
            }
            
            // Buyers can login immediately
            return redirect()->route('login')
                ->with('status', 'Email verified successfully! You can now log in.');
        }
        
        return redirect()->route('login')
            ->with('status', 'Email verified successfully! You can now log in.');
    }
    
    /**
     * Resend verification code
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);
        
        $user = User::where('email', $request->email)->first();
        
        // Check if already verified
        if ($user->verification_status === 'verified') {
            return back()->withErrors([
                'email' => 'This email is already verified.',
            ]);
        }
        
        // Create new OTP
        $verification = EmailVerification::createForEmail($request->email);

        try {
            Notification::route('mail', $request->email)
                ->notifyNow(new EmailVerificationNotification($verification->code));
        } catch (\Throwable $e) {
            \Log::error('Failed to resend OTP email', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'email' => 'We could not send the verification email right now. Please try again in a moment.',
            ]);
        }

        return back()->with('status', 'A new verification code has been sent to your email.');
    }
}
