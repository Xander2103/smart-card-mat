<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $friendships = Friendship::query()
            ->with(['requester:id,name,username', 'receiver:id,name,username'])
            ->where(function ($query) use ($userId) {
                $query
                    ->where('requester_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->latest()
            ->get();

        $friends = $friendships
            ->filter(fn (Friendship $friendship) => $friendship->status === Friendship::STATUS_ACCEPTED)
            ->map(function (Friendship $friendship) use ($userId) {
                return $friendship->requester_id === $userId
                    ? $friendship->receiver
                    : $friendship->requester;
            })
            ->values();

        $incomingRequests = $friendships
            ->filter(fn (Friendship $friendship) =>
                $friendship->status === Friendship::STATUS_PENDING
                && $friendship->receiver_id === $userId
            )
            ->values();

        $outgoingRequests = $friendships
            ->filter(fn (Friendship $friendship) =>
                $friendship->status === Friendship::STATUS_PENDING
                && $friendship->requester_id === $userId
            )
            ->values();

        return response()->json([
            'friends' => $friends,
            'incomingRequests' => $incomingRequests,
            'outgoingRequests' => $outgoingRequests,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id'],
        ]);

        $requesterId = $request->user()->id;
        $receiverId = (int) $validated['userId'];

        if ($requesterId === $receiverId) {
            return response()->json([
                'message' => 'Je kan jezelf niet als vriend toevoegen.',
            ], 422);
        }

        $existingFriendship = Friendship::query()
            ->where(function ($query) use ($requesterId, $receiverId) {
                $query
                    ->where('requester_id', $requesterId)
                    ->where('receiver_id', $receiverId);
            })
            ->orWhere(function ($query) use ($requesterId, $receiverId) {
                $query
                    ->where('requester_id', $receiverId)
                    ->where('receiver_id', $requesterId);
            })
            ->first();

        if ($existingFriendship) {
            return response()->json([
                'message' => $this->getExistingFriendshipMessage($existingFriendship, $requesterId),
                'friendship' => $existingFriendship->load([
                    'requester:id,name,username',
                    'receiver:id,name,username',
                ]),
            ], 409);
        }

        $friendship = Friendship::create([
            'requester_id' => $requesterId,
            'receiver_id' => $receiverId,
            'status' => Friendship::STATUS_PENDING,
        ]);

        return response()->json([
            'message' => 'Vriendschapsverzoek verstuurd.',
            'friendship' => $friendship->load([
                'requester:id,name,username',
                'receiver:id,name,username',
            ]),
        ], 201);
    }

    public function accept(Request $request, Friendship $friendship): JsonResponse
    {
        $userId = $request->user()->id;

        if ($friendship->receiver_id !== $userId) {
            abort(403, 'Alleen de ontvanger kan dit vriendschapsverzoek accepteren.');
        }

        if ($friendship->status !== Friendship::STATUS_PENDING) {
            return response()->json([
                'message' => 'Dit vriendschapsverzoek is niet meer pending.',
                'friendship' => $friendship->load([
                    'requester:id,name,username',
                    'receiver:id,name,username',
                ]),
            ], 409);
        }

        $friendship->update([
            'status' => Friendship::STATUS_ACCEPTED,
        ]);

        return response()->json([
            'message' => 'Vriendschapsverzoek geaccepteerd.',
            'friendship' => $friendship->fresh()->load([
                'requester:id,name,username',
                'receiver:id,name,username',
            ]),
        ]);
    }

    public function reject(Request $request, Friendship $friendship): JsonResponse
    {
        $userId = $request->user()->id;

        if ($friendship->receiver_id !== $userId) {
            abort(403, 'Alleen de ontvanger kan dit vriendschapsverzoek weigeren.');
        }

        if ($friendship->status !== Friendship::STATUS_PENDING) {
            return response()->json([
                'message' => 'Dit vriendschapsverzoek is niet meer pending.',
                'friendship' => $friendship->load([
                    'requester:id,name,username',
                    'receiver:id,name,username',
                ]),
            ], 409);
        }

        $friendship->update([
            'status' => Friendship::STATUS_REJECTED,
        ]);

        return response()->json([
            'message' => 'Vriendschapsverzoek geweigerd.',
            'friendship' => $friendship->fresh()->load([
                'requester:id,name,username',
                'receiver:id,name,username',
            ]),
        ]);
    }

    public function destroy(Request $request, Friendship $friendship): JsonResponse
    {
        $userId = $request->user()->id;

        if (
            $friendship->requester_id !== $userId
            && $friendship->receiver_id !== $userId
        ) {
            abort(403, 'Je hebt geen toegang tot deze friendship.');
        }

        $friendship->delete();

        return response()->json([
            'message' => 'Friendship verwijderd.',
        ]);
    }

    private function getExistingFriendshipMessage(Friendship $friendship, int $requesterId): string
    {
        if ($friendship->status === Friendship::STATUS_ACCEPTED) {
            return 'Jullie zijn al vrienden.';
        }

        if ($friendship->status === Friendship::STATUS_PENDING) {
            if ($friendship->requester_id === $requesterId) {
                return 'Je hebt al een vriendschapsverzoek naar deze user gestuurd.';
            }

            return 'Deze user heeft jou al een vriendschapsverzoek gestuurd.';
        }

        return 'Er bestaat al een eerdere friendship met deze user.';
    }
}
