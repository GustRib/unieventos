<?php

namespace App\Services;

use App\Enums\RegistrationStatus;
use App\Exceptions\BusinessException;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class FeedbackService
{
    public function store(User $user, Event $event, array $data): Feedback
    {
        $isRegistered = $event->registrations()
            ->where('user_id', $user->id)
            ->where('status', RegistrationStatus::Approved)
            ->exists();

        if (! $isRegistered) {
            throw new BusinessException('Only registered participants can submit feedback.');
        }

        $existingFeedback = Feedback::query()
            ->where('user_id', $user->id)
            ->where('event_id', $event->id)
            ->exists();

        if ($existingFeedback) {
            throw new BusinessException('You have already submitted feedback for this event.');
        }

        return Feedback::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ])->load('user');
    }

    public function listForEvent(Event $event): Collection
    {
        return Feedback::query()
            ->with('user')
            ->where('event_id', $event->id)
            ->latest()
            ->get();
    }
}
