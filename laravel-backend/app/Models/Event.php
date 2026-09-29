<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'events';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'description',
        'imageUrl',
        'date',
        'endDate',
        'location',
        'address',
        'latitude',
        'longitude',
        'price',
        'currency',
        'totalSeats',
        'soldSeats',
        'isFeatured',
        'isActive',
        'organizerName',
        'organizerAvatar',
        'tags',
        'categoryId',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'datetime',
            'endDate' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'price' => 'float',
            'totalSeats' => 'integer',
            'soldSeats' => 'integer',
            'isFeatured' => 'boolean',
            'isActive' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'categoryId');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'eventId');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class, 'eventId');
    }
}
