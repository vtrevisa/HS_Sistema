<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 */
	public function up(): void
	{
		Schema::create('alvaras', function (Blueprint $table) {
			$table->increments('id');
			$table->string('city', 100)->collation('utf8mb4_unicode_ci');
			$table->integer('year');
			$table->enum('month', ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'])
				->collation('utf8mb4_unicode_ci');
			$table->integer('avcb')->nullable()->default(0);
			$table->integer('clcb')->nullable()->default(0);
			// total_per_month will be added as a stored generated column below
			$table->timestamp('insert_date')->nullable()->useCurrent();
			$table->timestamp('update_date')->nullable()->useCurrent()->useCurrentOnUpdate();

			$table->index('city');
			$table->index('year');
			$table->index('month');
		});

		// Add stored generated column for total_per_month (avcb + clcb)
		try {
			DB::statement("ALTER TABLE `alvaras` ADD COLUMN `total_per_month` INT GENERATED ALWAYS AS ((COALESCE(`avcb`,0) + COALESCE(`clcb`,0))) STORED;");
		} catch (\Exception $e) {
			// ignore if DB doesn't support generated columns or column already exists
		}
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		if (Schema::hasTable('alvaras')) {
			try {
				// drop generated column if exists
				try {
					if (Schema::hasColumn('alvaras', 'total_per_month')) {
						Schema::table('alvaras', function (Blueprint $table) {
							try {
								$table->dropColumn('total_per_month');
							} catch (\Exception $e) {
								// ignore
							}
						});
					}
				} catch (\Exception $e) {
					// ignore
				}

				try {
					Schema::dropIfExists('alvaras');
				} catch (\Exception $e) {
					// ignore
				}
			} catch (\Exception $e) {
				// ignore overall errors during rollback
			}
		}
	}
};

