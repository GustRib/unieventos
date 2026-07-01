<?php

namespace App\Policies;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Event $event): bool
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

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::Organizer, UserRole::Admin], true);
    }

    public function update(User $user, Event $event): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }

        return $user->role === UserRole::Organizer && $event->organizer_id === $user->id;
    }

    public function delete(User $user, Event $event): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }

        return $user->role === UserRole::Organizer && $event->organizer_id === $user->id;
    }

    public function approve(User $user, Event $event): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function viewRegistrations(User $user, Event $event): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }

        return $user->role === UserRole::Organizer && $event->organizer_id === $user->id;
    }

    public function viewFeedbacks(?User $user, Event $event): bool
    {
        return $event->isApproved();
    }

    public function submitFeedback(User $user, Event $event): bool
    {
        return $user->role === UserRole::Participant;
    }

    public function registerForEvent(User $user, Event $event): bool
    {
        return $user->role === UserRole::Participant;
    }

    public function cancelRegistration(User $user, Event $event): bool
    {
        return $user->role === UserRole::Participant;
    }

    public function manageRegistration(User $user, Event $event): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }

        return $user->role === UserRole::Organizer && $event->organizer_id === $user->id;
    }
}
