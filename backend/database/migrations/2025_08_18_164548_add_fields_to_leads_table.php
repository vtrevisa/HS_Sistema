<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('status')->default('Lead')->after('ocupacao');
            $table->date('vencimento')->after('vigencia');
            $table->date('proxima_acao')->after('vencimento');
            $table->string('valor_servico')->nullable()->after('proxima_acao');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'vencimento',
                'proxima_acao',
                'valor_servico',
            ]);
        });
    }
};
