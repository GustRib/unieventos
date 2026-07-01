<?php

namespace App\Services;

use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Exceptions\BusinessException;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function register(User $user, Event $event): Registration
    {
        if ($event->status !== EventStatus::Approved) {
            throw new BusinessException('Event is not approved for registration.');
        }

        if ($event->available_vacancies <= 0) {
            throw new BusinessException('No vacancies available for this event.');
        }

        $existingRegistration = Registration::query()
            ->where('user_id', $user->id)
            ->where('event_id', $event->id)
            ->whereIn('status', [
                RegistrationStatus::Pending,
                RegistrationStatus::Approved,
            ])
            ->first();

        if ($existingRegistration) {
            throw new BusinessException('You are already registered for this event.');
        }

        return Registration::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'status' => RegistrationStatus::Pending,
        ])->load(['user', 'event']);
    }

    public function approve(Registration $registration): Registration
    {
        return DB::transaction(function () use ($registration) {
            $registration = Registration::query()->lockForUpdate()->findOrFail($registration->id);

            if ($registration->status !== RegistrationStatus::Pending) {
                throw new BusinessException('Only pending registrations can be approved.');
            }

            $event = Event::query()->lockForUpdate()->findOrFail($registration->event_id);

            if ($event->available_vacancies <= 0) {
                throw new BusinessException('No vacancies available for this event.');
            }

            $registration->update(['status' => RegistrationStatus::Approved]);
            $event->decrement('available_vacancies');

            return $registration->fresh(['user', 'event']);
        });
    }

    public function reject(Registration $registration): Registration
    {
        $registration = Registration::query()->findOrFail($registration->id);

        if ($registration->status !== RegistrationStatus::Pending) {
            throw new BusinessException('Only pending registrations can be rejected.');
        }

        $registration->update(['status' => RegistrationStatus::Rejected]);

        return $registration->fresh(['user', 'event']);
    }

    public function cancel(User $user, Event $event): void
    {
        DB::transaction(function () use ($user, $event) {
            $registration = Registration::query()
                ->where('user_id', $user->id)
                ->where('event_id', $event->id)
                ->whereIn('status', [
                    RegistrationStatus::Pending,
                    RegistrationStatus::Approved,
                ])
                ->lockForUpdate()
                ->first();

            if (! $registration) {
                throw new BusinessException('Registration not found.');
            }

            $wasApproved = $registration->status === RegistrationStatus::Approved;

            $registration->update(['status' => RegistrationStatus::Cancelled]);

            if ($wasApproved) {
                Event::query()
                    ->whereKey($event->id)
                    ->lockForUpdate()
                    ->first()
                    ?->increment('available_vacancies');
            }
        });
    }

    public function listForEvent(Event $event): Collection
    {
        return Registration::query()
            ->with('user')
            ->where('event_id', $event->id)
            ->latest()
            ->get();
    }

    public function listForUser(User $user): Collection
    {
        return Registration::query()
            ->with('event.organizer')
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }
}
