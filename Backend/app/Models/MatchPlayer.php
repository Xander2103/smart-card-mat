<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchPlayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'player_id',
        'user_id',
        'source',
        'username',
        'name',
        'score',
        'is_winner',
        'stats',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'score' => 'integer',
            'is_winner' => 'boolean',
            'stats' => 'array',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(MatchModel::class, 'match_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}