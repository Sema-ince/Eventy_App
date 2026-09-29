<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'categories';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'icon',
        'color',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'categoryId');
    }
}
