<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Get all categories with event counts
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('events')->get()->map(function ($cat) {
            return [
                'id'     => $cat->id,
                'name'   => $cat->name,
                'icon'   => $cat->icon,
                'color'  => $cat->color,
                '_count' => [
                    'events' => $cat->events_count,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $categories,
        ]);
    }
}
