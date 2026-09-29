<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Get all favorite events of the current authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $favoriteEventIds = Favorite::where('userId', $user->id)->pluck('eventId');

        $events = Event::with('category')
            ->withCount(['tickets', 'favorites'])
            ->whereIn('id', $favoriteEventIds)
            ->get();

        $formatted = $events->map(function ($event) {
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
                'isFavorited'     => true,
                '_count'          => [
                    'tickets'   => $event->tickets_count ?? $event->tickets()->count(),
                    'favorites' => $event->favorites_count ?? $event->favorites()->count(),
                ],
                'createdAt'       => $event->created_at ? $event->created_at->toISOString() : null,
                'updatedAt'       => $event->updated_at ? $event->updated_at->toISOString() : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $formatted,
        ]);
    }

    /**
     * Add event to user's favorites
     */
    public function store(Request $request, string $eventId): JsonResponse
    {
        $user = $request->user();

        $event = Event::find($eventId);
        if (! $event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
            ], 404);
        }

        Favorite::firstOrCreate([
            'userId'  => $user->id,
            'eventId' => $eventId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event added to favorites',
        ]);
    }

    /**
     * Remove event from user's favorites
     */
    public function destroy(Request $request, string $eventId): JsonResponse
    {
        $user = $request->user();

        Favorite::where('userId', $user->id)->where('eventId', $eventId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event removed from favorites',
        ]);
    }

    /**
     * Check if event is in user's favorites
     */
    public function check(Request $request, string $eventId): JsonResponse
    {
        $user = $request->user();

        $isFavorited = Favorite::where('userId', $user->id)->where('eventId', $eventId)->exists();

        return response()->json([
            'success' => true,
            'data'    => [
                'isFavorited' => $isFavorited,
            ],
        ]);
    }
}
