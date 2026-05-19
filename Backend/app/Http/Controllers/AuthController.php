<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'alpha_dash',
                'unique:users,username',
            ],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'username' => strtolower(trim($validated['username'])),
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'],
        ]);

        $token = $user->createToken('smart-card-mat')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $login = strtolower(trim($validated['login']));

        $user = User::query()
            ->where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['These login credentials are not correct.'],
            ]);
        }

        $token = $user->createToken('smart-card-mat')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower(trim($validated['email']));
        $rateLimitKey = 'password-reset:' . $email;

        if (RateLimiter::tooManyAttempts($rateLimitKey, 2)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);

            return response()->json([
                'message' => 'Je kan maximaal 2 password reset mails per dag aanvragen. Probeer later opnieuw.',
                'retry_after_seconds' => $seconds,
            ], 429);
        }

        RateLimiter::hit($rateLimitKey, 86400);

        $user = User::query()
            ->where('email', $email)
            ->first();

        // Geen user enumeration: altijd dezelfde algemene response.
        if (!$user) {
            return response()->json([
                'message' => 'Als dit e-mailadres bestaat, werd er een reset link verstuurd.',
            ]);
        }

        $plainToken = Str::random(64);

        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($plainToken),
            'created_at' => Carbon::now(),
        ]);

        $frontendUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        $resetUrl = $frontendUrl . '/reset-password?email=' . urlencode($email) . '&token=' . urlencode($plainToken);

        Mail::raw(
            "Hi {$user->name},\n\n" .
            "Je vroeg een password reset aan voor Smart Card Mat.\n\n" .
            "Klik op deze link om je wachtwoord opnieuw in te stellen:\n" .
            $resetUrl . "\n\n" .
            "Deze link is 60 minuten geldig.\n\n" .
            "Als jij dit niet was, mag je deze mail negeren.\n\n" .
            "Smart Card Mat",
            function ($message) use ($email) {
                $message->to($email)
                    ->subject('Reset your Smart Card Mat password');
            }
        );

        return response()->json([
            'message' => 'Als dit e-mailadres bestaat, werd er een reset link verstuurd.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $email = strtolower(trim($validated['email']));

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'token' => ['Deze reset token is ongeldig of verlopen.'],
            ]);
        }

        $createdAt = Carbon::parse($resetRecord->created_at);

        if ($createdAt->lt(Carbon::now()->subMinutes(60))) {
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            throw ValidationException::withMessages([
                'token' => ['Deze reset token is verlopen. Vraag een nieuwe reset link aan.'],
            ]);
        }

        if (!Hash::check($validated['token'], $resetRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['Deze reset token is ongeldig of verlopen.'],
            ]);
        }

        $user = User::query()
            ->where('email', $email)
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Er bestaat geen account met dit e-mailadres.'],
            ]);
        }

        $user->password = $validated['password'];
        $user->tokens()->delete();
        $user->save();

        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        return response()->json([
            'message' => 'Je wachtwoord werd aangepast. Login opnieuw met je nieuwe wachtwoord.',
        ]);
    }
}