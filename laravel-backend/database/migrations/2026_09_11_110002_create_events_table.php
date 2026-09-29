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
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->text('imageUrl');
            $table->dateTime('date');
            $table->dateTime('endDate')->nullable();
            $table->string('location');
            $table->text('address');
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->double('price')->default(0);
            $table->string('currency', 10)->default('TRY');
            $table->integer('totalSeats')->default(100);
            $table->integer('soldSeats')->default(0);
            $table->boolean('isFeatured')->default(false);
            $table->boolean('isActive')->default(true);
            $table->string('organizerName');
            $table->text('organizerAvatar')->nullable();
            $table->text('tags')->default('[]');
            $table->foreignUuid('categoryId')->constrained('categories')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
