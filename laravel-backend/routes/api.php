<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Helper to register API endpoints
$registerRoutes = function () {
    // ─── Public Auth Routes ─────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // ─── Public Events & Categories Routes ──────────────────────────────
    Route::get('/categories', [CategoryController::class, 'index']);

    Route::prefix('events')->group(function () {
        Route::get('/', [EventController::class, 'index']);
        Route::get('/featured', [EventController::class, 'featured']);
        Route::get('/categories', [EventController::class, 'categories']);
        Route::get('/{id}', [EventController::class, 'show']);
    });

    // ─── Protected Routes (Requires Bearer Token via Sanctum) ───────────
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/me', [AuthController::class, 'updateMe']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Favorites
        Route::prefix('favorites')->group(function () {
            Route::get('/', [FavoriteController::class, 'index']);
            Route::post('/{eventId}', [FavoriteController::class, 'store']);
            Route::delete('/{eventId}', [FavoriteController::class, 'destroy']);
            Route::get('/check/{eventId}', [FavoriteController::class, 'check']);
        });

        // Tickets
        Route::prefix('tickets')->group(function () {
            Route::get('/', [TicketController::class, 'index']);
            Route::post('/purchase', [TicketController::class, 'purchase']);
            Route::get('/{id}', [TicketController::class, 'show']);
        });
    });
};

// Register directly under /api/...
$registerRoutes();

// Also register under /api/v1/... for backward compatibility
Route::prefix('v1')->group($registerRoutes);

