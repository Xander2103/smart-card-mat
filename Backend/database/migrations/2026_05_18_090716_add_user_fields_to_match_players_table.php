<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_players', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('match_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->string('source', 30)
                ->default('guest')
                ->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('match_players', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'source']);
        });
    }
};