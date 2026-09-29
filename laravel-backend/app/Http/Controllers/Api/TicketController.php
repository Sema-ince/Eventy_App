<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    /**
     * Get user tickets categorized into all, active, past
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $tickets = Ticket::with(['event.category', 'user'])
            ->where('userId', $user->id)
            ->orderBy('purchasedAt', 'desc')
            ->get();

        $all = [];
        $active = [];
        $past = [];

        $now = Carbon::now();

        foreach ($tickets as $ticket) {
            $formatted = $this->formatTicket($ticket);
            $all[] = $formatted;

            $eventDate = $ticket->event ? Carbon::parse($ticket->event->date) : null;
            $isActive = $ticket->status === 'ACTIVE' && ($eventDate === null || $eventDate->isFuture() || $eventDate->isToday());

            if ($isActive) {
                $active[] = $formatted;
            } else {
                $past[] = $formatted;
            }
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'all'    => $all,
                'active' => $active,
                'past'   => $past,
            ],
        ]);
    }

    /**
     * Purchase ticket for an event
     */
    public function purchase(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'eventId'  => 'required|string|exists:events,id',
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $event = Event::findOrFail($validated['eventId']);
        $quantity = (int) $validated['quantity'];

        // --- YENİ EKLENEN TARİH GÜVENLİK KONTROLÜ ---
        if (Carbon::parse($event->date)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Bu etkinliğin tarihi geçtiği için bilet alamazsınız.',
                'error'   => 'Event has already passed',
            ], 400);
        }
        // -------------------------------------------

        if ($event->soldSeats + $quantity > $event->totalSeats) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough seats available for this event.',
                'error'   => 'Capacity exceeded',
            ], 400);
        }

        $totalPrice = round($event->price * $quantity, 2);
        $ticketNumber = 'EVT-' . strtoupper(Str::random(8));
        $qrCode = "EVENTLY:{$ticketNumber}:{$event->id}:{$user->id}:{$quantity}";

        $ticket = Ticket::create([
            'ticketNumber' => $ticketNumber,
            'qrCode'       => $qrCode,
            'status'       => 'ACTIVE',
            'quantity'     => $quantity,
            'totalPrice'   => $totalPrice,
            'purchasedAt'  => now(),
            'userId'       => $user->id,
            'eventId'      => $event->id,
        ]);

        // Increment event sold seats
        $event->increment('soldSeats', $quantity);

        $ticket->load(['event.category', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Ticket purchased successfully',
            'data'    => $this->formatTicket($ticket),
        ], 201);
    }

    /**
     * Get ticket by ID
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $ticket = Ticket::with(['event.category', 'user'])
            ->where('userId', $user->id)
            ->where('id', $id)
            ->first();

        if (! $ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatTicket($ticket),
        ]);
    }

    /**
     * Helper to format Ticket model
     */
    private function formatTicket(Ticket $ticket): array
    {
        $event = $ticket->event;

        $statusTr = match ($ticket->status) {
            'ACTIVE'    => 'aktif',
            'USED'      => 'kullanıldı',
            'CANCELLED' => 'iptal',
            'EXPIRED'   => 'süresi doldu',
            default     => strtolower($ticket->status),
        };

        return [
            'id'            => $ticket->id,
            'ticketNumber'  => $ticket->ticketNumber,
            'ticket_number' => $ticket->ticketNumber,
            'qrCode'        => $ticket->qrCode,
            'qr_code'       => $ticket->qrCode,
            'status'        => $ticket->status,
            'status_tr'     => $statusTr,
            'quantity'      => (int) $ticket->quantity,
            'totalPrice'    => (float) $ticket->totalPrice,
            'price'         => (float) $ticket->totalPrice,
            'purchasedAt'   => $ticket->purchasedAt ? $ticket->purchasedAt->toISOString() : $ticket->created_at->toISOString(),
            'purchase_date' => $ticket->purchasedAt ? $ticket->purchasedAt->toISOString() : $ticket->created_at->toISOString(),
            'userId'        => $ticket->userId,
            'user_id'       => $ticket->userId,
            'eventId'       => $ticket->eventId,
            'event_id'      => $ticket->eventId,
            'event'         => $event ? [
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
                'createdAt'       => $event->created_at ? $event->created_at->toISOString() : null,
                'updatedAt'       => $event->updated_at ? $event->updated_at->toISOString() : null,
            ] : null,
            'user'          => $ticket->user ? [
                'id'    => $ticket->user->id,
                'name'  => $ticket->user->name,
                'email' => $ticket->user->email,
            ] : null,
        ];
    }
}