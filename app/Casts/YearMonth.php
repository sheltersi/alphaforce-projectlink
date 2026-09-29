<?php

namespace App\Casts;

use DateTimeInterface;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;

/**
 * Month-granularity dates persisted as YYYY-MM strings (CHAR(7) columns).
 *
 * The plain `date` cast serializes to full datetimes on write, which
 * overflows the 7-character columns on strict databases. This cast keeps
 * month precision on write while still exposing a date instance on read.
 *
 * @implements CastsAttributes<DateTimeInterface|null, string|DateTimeInterface|null>
 */
class YearMonth implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        return Date::parse($value)->startOfMonth();
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Date::parse($value)->format('Y-m');
        }

        return substr((string) $value, 0, 7);
    }
}
