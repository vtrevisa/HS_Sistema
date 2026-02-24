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
        Schema::table('archived_proposals', function (Blueprint $table) {
            $table->dropForeign(['lead_id']);

            // make lead_id nullable
            $table->unsignedBigInteger('lead_id')->nullable()->change();

            // create new FK
            $table->foreign('lead_id')
                ->references('id')
                ->on('leads')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('archived_proposals')) {
            try {
                Schema::table('archived_proposals', function (Blueprint $table) {
                    try {
                        $table->dropForeign(['lead_id']);
                    } catch (\Exception $e) {
                        // ignore if foreign doesn't exist
                    }

                    try {
                        $table->unsignedBigInteger('lead_id')->nullable(false)->change();
                    } catch (\Exception $e) {
                        // ignore if column change fails
                    }

                    try {
                        $table->foreign('lead_id')
                            ->references('id')
                            ->on('leads')
                            ->onDelete('cascade');
                    } catch (\Exception $e) {
                        // ignore if foreign can't be created
                    }
                });
            } catch (\Exception $e) {
                // ignore overall table alteration errors during rollback
            }
        }
    }
};
