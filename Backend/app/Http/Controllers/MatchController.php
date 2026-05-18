<?php

namespace App\Http\Controllers;

use App\Models\MatchModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class MatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $matches = MatchModel::query()
            ->with(['user', 'players'])
            ->where('user_id', $request->user()->id)
            ->latest('played_at')
            ->latest()
            ->get();

        return response()->json($matches);
    }

    public function show(Request $request, MatchModel $match): JsonResponse
    {
        if ($match->user_id !== $request->user()->id) {
            abort(403, 'Je hebt geen toegang tot deze match.');
        }

        return response()->json(
            $match->load(['user', 'players'])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['nullable', 'string', 'max:100'],

            'gameType' => ['required', 'string', 'max:50'],
            'playedAt' => ['required', 'date'],

            'players' => ['required', 'array', 'min:1', 'max:8'],
            'players.*.playerId' => ['required', 'string', 'max:100'],
            'players.*.name' => ['required', 'string', 'max:100'],

            'winnerIds' => ['nullable', 'array'],
            'winnerIds.*' => ['string', 'max:100'],

            'scores' => ['required', 'array', 'min:1'],
            'scores.*.playerId' => ['required', 'string', 'max:100'],
            'scores.*.score' => ['required', 'integer'],
            'scores.*.rank' => ['nullable', 'integer', 'min:1'],

            'metadata' => ['nullable', 'array'],
            'gameData' => ['nullable', 'array'],
        ]);

        $clientMatchId = $validated['id'] ?? null;
        $userId = $request->user()->id;

        if ($clientMatchId) {
            $existingMatch = MatchModel::query()
                ->where('client_match_id', $clientMatchId)
                ->with(['user', 'players'])
                ->first();

            if ($existingMatch) {
                if ($existingMatch->user_id === null) {
                    $existingMatch->update([
                        'user_id' => $userId,
                    ]);

                    return response()->json(
                        $existingMatch->fresh()->load(['user', 'players'])
                    );
                }

                if ((int) $existingMatch->user_id !== (int) $userId) {
                    abort(403, 'Deze match bestaat al op een andere account.');
                }

                return response()->json($existingMatch);
            }
        }

        $scoreRowsByPlayerId = collect($validated['scores'])->keyBy('playerId');
        $winnerIds = collect($validated['winnerIds'] ?? []);

        $match = DB::transaction(function () use (
            $validated,
            $scoreRowsByPlayerId,
            $winnerIds,
            $clientMatchId,
            $userId
        ) {
            $match = MatchModel::create([
                'client_match_id' => $clientMatchId,
                'user_id' => $userId,
                'mode' => $validated['gameType'],
                'played_at' => $validated['playedAt'],
                'winner_player_id' => $winnerIds->first(),
                'rounds_played' => $this->extractRoundsPlayed($validated),
                'raw_state' => $validated,
            ]);

            foreach ($validated['players'] as $player) {
                $scoreRow = $scoreRowsByPlayerId->get($player['playerId']);

                $match->players()->create([
                    'player_id' => $player['playerId'],
                    'name' => $player['name'],
                    'score' => (int) Arr::get($scoreRow, 'score', 0),
                    'is_winner' => $winnerIds->contains($player['playerId']),
                    'stats' => [
                        'rank' => Arr::get($scoreRow, 'rank'),
                        'scoreRow' => $scoreRow,
                    ],
                ]);
            }

            return $match->load(['user', 'players']);
        });

        return response()->json($match, 201);
    }

    private function extractRoundsPlayed(array $matchRecord): ?int
    {
        $metadataRoundCount = Arr::get($matchRecord, 'metadata.roundsPlayed');

        if (is_numeric($metadataRoundCount)) {
            return (int) $metadataRoundCount;
        }

        $summaryTotalRounds = Arr::get($matchRecord, 'gameData.summary.totalRounds');

        if (is_numeric($summaryTotalRounds)) {
            return (int) $summaryTotalRounds;
        }

        $contracts = Arr::get($matchRecord, 'gameData.contracts');

        if (is_array($contracts)) {
            return count($contracts);
        }

        $history = Arr::get($matchRecord, 'gameData.history');

        if (is_array($history)) {
            return count($history);
        }

        return null;
    }
}