<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'event_date' => $this->event_date?->toISOString(),
            'vacancies' => $this->vacancies,
            'available_vacancies' => $this->available_vacancies,
            'status' => $this->status->value,
            'organizer' => new UserResource($this->whenLoaded('organizer')),
            'organizer_id' => $this->organizer_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
