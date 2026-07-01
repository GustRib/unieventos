<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;

class RegistrationPolicy
{
    public function register(User $user, Event $event): bool
    {
        return $user->role === UserRole::Participant;
    }

    public function cancel(User $user, Event $event): bool
    {
        return $user->role === UserRole::Participant;
    }

    public function viewAny(User $user, Event $event): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }

        return $user->role === UserRole::Organizer && $event->organizer_id === $user->id;
    }
}
