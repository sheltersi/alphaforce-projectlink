<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $user_id
 * @property string $token
 * @property Carbon|null $expires_at
 * @property Carbon|null $revoked_at
 * @property int $view_count
 * @property Carbon|null $last_viewed_at
 * @property string|null $last_viewed_ip
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ResumeShareLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
        'revoked_at',
        'view_count',
        'last_viewed_at',
        'last_viewed_ip',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'last_viewed_at' => 'datetime',
            'view_count' => 'integer',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to links that are currently usable: not revoked, not expired.
     *
     * @param  Builder<ResumeShareLink>  $query
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->whereNull('revoked_at')
            ->where(function (Builder $q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    public function recordView(?string $ip = null): void
    {
        $this->forceFill([
            'view_count' => $this->view_count + 1,
            'last_viewed_at' => now(),
            'last_viewed_ip' => $ip,
        ])->save();
    }

    public function revoke(): void
    {
        if ($this->revoked_at !== null) {
            return;
        }

        $this->forceFill(['revoked_at' => now()])->save();
    }

    /**
     * Generate a cryptographically secure URL-safe token.
     */
    public static function generateToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
