<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $notifications = $user->notifications()->latest()->paginate(20)->withQueryString();

        return Inertia::render('notifications/index', [
            'notifications' => $notifications->getCollection()->map(function ($notification): array {
                $data = $notification->data;
                $body = data_get($data, 'body', []);

                if (is_string($body)) {
                    $body = [$body];
                }

                $title = data_get($data, 'title');
                $message = data_get($data, 'message');
                $actionLabel = data_get($data, 'action_label');

                return [
                    'id' => $notification->id,
                    'title' => is_string($title) && $title !== ''
                        ? $title
                        : Str::headline(class_basename($notification->type)),
                    'message' => is_string($message) && $message !== ''
                        ? $message
                        : 'You have a new notification.',
                    'body' => collect(is_array($body) ? $body : [])
                        ->filter(fn ($line) => is_string($line) && trim($line) !== '')
                        ->values(),
                    'actionLabel' => is_string($actionLabel) ? $actionLabel : null,
                    'actionUrl' => $this->safeActionUrl(data_get($data, 'action_url')),
                    'readAt' => $notification->read_at?->toISOString(),
                    'createdAt' => $notification->created_at?->toISOString(),
                ];
            })->values(),
            'unreadCount' => $user->unreadNotifications()->count(),
            'pagination' => [
                'currentPage' => $notifications->currentPage(),
                'lastPage' => $notifications->lastPage(),
                'previousPageUrl' => $notifications->previousPageUrl(),
                'nextPageUrl' => $notifications->nextPageUrl(),
            ],
        ]);
    }

    public function markRead(Request $request, string $notification): RedirectResponse
    {
        $record = $request->user()->notifications()->whereKey($notification)->firstOrFail();
        $record->markAsRead();

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }

    private function safeActionUrl(mixed $url): ?string
    {
        if (! is_string($url) || $url === '') {
            return null;
        }

        if (str_starts_with($url, '/') && ! str_starts_with($url, '//')) {
            return $url;
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        $host = parse_url($url, PHP_URL_HOST);
        $allowedHosts = collect([
            config('app.url'),
            config('app.organisation_app_url'),
        ])->map(fn ($baseUrl) => parse_url((string) $baseUrl, PHP_URL_HOST))
            ->filter()
            ->map(fn (string $allowedHost) => strtolower($allowedHost));

        return in_array(strtolower((string) $scheme), ['http', 'https'], true)
            && $host !== null
            && $allowedHosts->contains(strtolower($host)
            ) ? $url : null;
    }
}
