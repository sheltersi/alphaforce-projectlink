<?php

namespace App\Http\Resources\Organisation;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Notification */
class NotificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $message = data_get($this->data, 'message', '');

        return [
            'id' => $this->id,
            'type' => class_basename($this->type),
            'title' => data_get($this->data, 'title', 'Notification'),
            'message' => $message,
            'body' => data_get($this->data, 'body', [$message]),
            'action_label' => data_get($this->data, 'action_label'),
            'action_url' => data_get($this->data, 'action_url'),
            'read_at' => $this->read_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
