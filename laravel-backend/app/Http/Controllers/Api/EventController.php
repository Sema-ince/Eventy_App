<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    /**
     * List events with filtering, search, pagination, and sorting
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::with('category')->withCount(['tickets', 'favorites'])->where('isActive', true);

        // Search in title, description, location, organizerName, and category name
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('organizerName', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by category (by category id or category name)
        if ($request->filled('category')) {
            $categoryVal = $request->query('category');
            $query->where(function ($q) use ($categoryVal) {
                $q->where('categoryId', $categoryVal)
                  ->orWhereHas('category', function ($cq) use ($categoryVal) {
                      $cq->where('name', $categoryVal);
                  });
            });
        }

        // Filter by featured
        if ($request->boolean('featured')) {
            $query->where('isFeatured', true);
        }

        // Filter by price range
        if ($request->filled('minPrice')) {
            $query->where('price', '>=', (float) $request->query('minPrice'));
        }
        if ($request->filled('maxPrice')) {
            $query->where('price', '<=', (float) $request->query('maxPrice'));
        }

        // Sorting
        $sort = $request->query('sort', 'date_asc');
        switch ($sort) {
            case 'date_desc':
                $query->orderBy('date', 'desc');
                break;
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderBy('soldSeats', 'desc');
                break;
            case 'date_asc':
            default:
                $query->orderBy('date', 'asc');
                break;
        }

        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, min(50, (int) $request->query('limit', 10)));

        $total = $query->count();
        $totalPages = (int) ceil($total / $limit);

        $events = $query->skip(($page - 1) * $limit)->take($limit)->get();

        $userId = $this->resolveUserId($request);
        $favoriteIds = $userId ? Favorite::where('userId', $userId)->pluck('eventId')->toArray() : [];

        $formatted = $events->map(fn ($e) => $this->formatEvent($e, in_array($e->id, $favoriteIds)));

        return response()->json([
            'success' => true,
            'data'    => $formatted,
            'meta'    => [
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
                'totalPages'  => $totalPages,
                'hasNextPage' => $page < $totalPages,
                'hasPrevPage' => $page > 1,
            ],
        ]);
    }

    /**
     * Get featured events
     */
    public function featured(Request $request): JsonResponse
    {
        $events = Event::with('category')
            ->withCount(['tickets', 'favorites'])
            ->where('isActive', true)
            ->where('isFeatured', true)
            ->orderBy('date', 'asc')
            ->take(5)
            ->get();

        // If no featured events, grab the most popular
        if ($events->isEmpty()) {
            $events = Event::with('category')
                ->withCount(['tickets', 'favorites'])
                ->where('isActive', true)
                ->orderBy('soldSeats', 'desc')
                ->take(5)
                ->get();
        }

        $userId = $this->resolveUserId($request);
        $favoriteIds = $userId ? Favorite::where('userId', $userId)->pluck('eventId')->toArray() : [];

        $formatted = $events->map(fn ($e) => $this->formatEvent($e, in_array($e->id, $favoriteIds)));

        return response()->json([
            'success' => true,
            'data'    => $formatted,
        ]);
    }

    /**
     * Get categories list
     */
    public function categories(): JsonResponse
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

    /**
     * Get single event detail by ID
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $event = Event::with('category')->withCount(['tickets', 'favorites'])->find($id);

        if (! $event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
            ], 404);
        }

        $userId = $this->resolveUserId($request);
        $isFavorited = $userId ? Favorite::where('userId', $userId)->where('eventId', $event->id)->exists() : false;

        return response()->json([
            'success' => true,
            'data'    => $this->formatEvent($event, $isFavorited),
        ]);
    }

    /**
     * Resolve authenticated user ID if Bearer token is provided
     */
    private function resolveUserId(Request $request): ?string
    {
        $user = Auth::guard('sanctum')->user();
        return $user ? $user->id : null;
    }

    /**
     * Format Event object to exact structure expected by React Native UI
     */
    private function formatEvent(Event $event, bool $isFavorited = false): array
    {
        return [
            'id'              => $event->id,
            'title'           => $event->title,
            'description'     => $event->description,
            'imageUrl'        => $event->imageUrl,
            'image'           => $event->imageUrl,
            'date'            => $event->date ? $event->date->toISOString() : null,
            'endDate'         => $event->endDate ? $event->endDate->toISOString() : null,
            'start_time'      => $event->date ? $event->date->toISOString() : null,
            'end_time'        => $event->endDate ? $event->endDate->toISOString() : null,
            'location'        => $event->location,
            'address'         => $event->address,
            'latitude'        => $event->latitude,
            'longitude'       => $event->longitude,
            'price'           => (float) $event->price,
            'currency'        => $event->currency,
            'totalSeats'      => (int) $event->totalSeats,
            'capacity'        => (int) $event->totalSeats,
            'soldSeats'       => (int) $event->soldSeats,
            'isFeatured'      => (bool) $event->isFeatured,
            'isActive'        => (bool) $event->isActive,
            'organizerName'   => $event->organizerName,
            'organizer'       => $event->organizerName,
            'organizerAvatar' => $event->organizerAvatar,
            'tags'            => $event->tags,
            'categoryId'      => $event->categoryId,
            'category_id'     => $event->categoryId,
            'category'        => $event->category ? [
                'id'    => $event->category->id,
                'name'  => $event->category->name,
                'icon'  => $event->category->icon,
                'color' => $event->category->color,
            ] : null,
            'isFavorited'     => $isFavorited,
            '_count'          => [
                'tickets'   => $event->tickets_count ?? $event->tickets()->count(),
                'favorites' => $event->favorites_count ?? $event->favorites()->count(),
            ],
            'createdAt'       => $event->created_at ? $event->created_at->toISOString() : null,
            'updatedAt'       => $event->updated_at ? $event->updated_at->toISOString() : null,
        ];
    }
}
