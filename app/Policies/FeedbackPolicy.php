<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;

class FeedbackPolicy
{
    public function create(User $user, Event $event): bool
    {
        return $user->role === UserRole::Participant;
    }

    public function viewAny(?User $user, Event $event): bool
    {
        return $event->isApproved();
    }
}
