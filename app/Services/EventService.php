<?php

namespace App\Services;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EventService
{
    public function listForUser(?User $user): LengthAwarePaginator
    {
        $query = Event::query()->with('organizer');

        if (! $user) {
            return $query
                ->where('status', EventStatus::Approved)
                ->latest('event_date')
                ->paginate(15);
        }

        if ($user->role === UserRole::Admin) {
            return $query->latest('event_date')->paginate(15);
        }

        if ($user->role === UserRole::Organizer) {
            return $query
                ->where(function ($q) use ($user) {
                    $q->where('organizer_id', $user->id)
                        ->orWhere('status', EventStatus::Approved);
                })
                ->latest('event_date')
                ->paginate(15);
        }

        return $query
            ->where('status', EventStatus::Approved)
            ->latest('event_date')
            ->paginate(15);
    }

    public function create(User $organizer, array $data): Event
    {
        return Event::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'location' => $data['location'],
            'event_date' => $data['event_date'],
            'vacancies' => $data['vacancies'],
            'available_vacancies' => $data['vacancies'],
            'status' => EventStatus::Pending,
            'organizer_id' => $organizer->id,
        ]);
    }

    public function update(Event $event, array $data): Event
    {
        $updateData = collect($data)->only([
            'title',
            'description',
            'location',
            'event_date',
            'vacancies',
            'status',
        ])->filter(fn ($value) => $value !== null)->all();

        if (isset($updateData['vacancies']) && $updateData['vacancies'] !== $event->vacancies) {
            $registeredCount = $event->vacancies - $event->available_vacancies;
            $updateData['available_vacancies'] = max(0, $updateData['vacancies'] - $registeredCount);
        }

        $event->update($updateData);

        return $event->fresh(['organizer']);
    }

    public function delete(Event $event): void
    {
        $event->delete();
    }

    public function canUserView(?User $user, Event $event): bool
    {
        if ($event->status === EventStatus::Approved) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->role === UserRole::Admin) {
            return true;
        }

        return $user->role === UserRole::Organizer && $event->organizer_id === $user->id;
    }
}
