<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tickets';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ticketNumber',
        'qrCode',
        'status',
        'quantity',
        'totalPrice',
        'purchasedAt',
        'userId',
        'eventId',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'totalPrice' => 'float',
            'purchasedAt' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'eventId');
    }
}
