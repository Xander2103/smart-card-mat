<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatchModel extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'client_match_id',
        'mode',
        'played_at',
        'winner_player_id',
        'rounds_played',
        'raw_state',
    ];

    protected function casts(): array
    {
        return [
            'played_at' => 'datetime',
            'rounds_played' => 'integer',
            'raw_state' => 'array',
        ];
    }

    public function players(): HasMany
    {
        return $this->hasMany(MatchPlayer::class, 'match_id');
    }
}