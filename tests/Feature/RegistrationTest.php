<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_register_for_approved_event(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create(['available_vacancies' => 10]);
        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/events/{$event->id}/register");

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registration completed successfully',
            ]);

        $this->assertDatabaseHas('registrations', [
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'status' => RegistrationStatus::Approved->value,
        ]);

        $this->assertEquals(9, $event->fresh()->available_vacancies);
    }

    public function test_participant_cannot_register_twice(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create(['available_vacancies' => 10]);
        Sanctum::actingAs($participant);

        $this->postJson("/api/events/{$event->id}/register");
        $response = $this->postJson("/api/events/{$event->id}/register");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'You are already registered for this event.',
            ]);
    }

    public function test_participant_cannot_register_for_pending_event(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->pending()->create();
        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/events/{$event->id}/register");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Event is not approved for registration.',
            ]);
    }

    public function test_cancellation_restores_vacancy(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create([
            'vacancies' => 10,
            'available_vacancies' => 9,
        ]);

        Registration::factory()->create([
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'status' => RegistrationStatus::Approved,
        ]);

        Sanctum::actingAs($participant);

        $response = $this->deleteJson("/api/events/{$event->id}/register");

        $response->assertOk();
        $this->assertEquals(10, $event->fresh()->available_vacancies);
        $this->assertDatabaseHas('registrations', [
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'status' => RegistrationStatus::Cancelled->value,
        ]);
    }

    public function test_organizer_can_view_event_registrations(): void
    {
        $organizer = User::factory()->organizer()->create();
        $event = Event::factory()->approved()->create(['organizer_id' => $organizer->id]);
        Registration::factory()->count(2)->create(['event_id' => $event->id]);
        Sanctum::actingAs($organizer);

        $response = $this->getJson("/api/events/{$event->id}/registrations");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
