<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $query = trim($validated['query']);

        $users = User::query()
            ->where(function ($builder) use ($query) {
                $builder
                    ->where('username', 'like', "%{$query}%")
                    ->orWhere('name', 'like', "%{$query}%");
            })
            ->orderBy('username')
            ->limit(10)
            ->get([
                'id',
                'name',
                'username',
            ]);

        return response()->json([
            'users' => $users,
        ]);
    }
}