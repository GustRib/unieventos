<?php

namespace Database\Factories;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $vacancies = fake()->numberBetween(10, 100);

        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'location' => fake()->address(),
            'event_date' => fake()->dateTimeBetween('+1 week', '+3 months'),
            'vacancies' => $vacancies,
            'available_vacancies' => $vacancies,
            'status' => EventStatus::Pending,
            'organizer_id' => User::factory()->state(['role' => UserRole::Organizer]),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => EventStatus::Approved,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => EventStatus::Pending,
        ]);
    }
}
