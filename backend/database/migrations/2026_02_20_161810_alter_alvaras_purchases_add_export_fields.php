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
        Schema::table('alvaras_purchases', function (Blueprint $table) {

            $table->foreignId('company_id')
                ->nullable()
                ->constrained('companies')
                ->nullOnDelete()
                ->after('user_id');
            $table->timestamp('exported_at')->nullable()->after('validity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('alvaras_purchases')) {
            try {
                Schema::table('alvaras_purchases', function (Blueprint $table) {
                    try {
                        $table->dropForeign(['company_id']);
                    } catch (\Exception $e) {
                        // ignore if foreign key doesn't exist
                    }

                    try {
                        if (Schema::hasColumn('alvaras_purchases', 'company_id')) {
                            $table->dropColumn('company_id');
                        }
                        if (Schema::hasColumn('alvaras_purchases', 'exported_at')) {
                            $table->dropColumn('exported_at');
                        }
                    } catch (\Exception $e) {
                        // ignore if columns already removed or other SQL errors
                    }

                    try {
                        if (Schema::hasColumn('alvaras_purchases', 'created_at') || Schema::hasColumn('alvaras_purchases', 'updated_at')) {
                            $table->dropTimestamps();
                        }
                    } catch (\Exception $e) {
                        // ignore
                    }
                });
            } catch (\Exception $e) {
                // ignore overall table alterations errors during rollback
            }
        }
    }
};
