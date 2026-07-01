<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_only_see_approved_events(): void
    {
        $organizer = User::factory()->organizer()->create();
        Event::factory()->approved()->create(['organizer_id' => $organizer->id]);
        Event::factory()->pending()->create(['organizer_id' => $organizer->id]);

        $response = $this->getJson('/api/events');

        $response->assertOk();
        $this->assertCount(1, $response->json('data.events'));
    }

    public function test_admin_can_see_pending_and_approved_events(): void
    {
        $admin = User::factory()->admin()->create();
        $organizer = User::factory()->organizer()->create();
        Event::factory()->approved()->create(['organizer_id' => $organizer->id]);
        Event::factory()->pending()->create(['organizer_id' => $organizer->id]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/events');

        $response->assertOk();
        $this->assertCount(2, $response->json('data.events'));
    }

    public function test_organizer_can_create_event(): void
    {
        $organizer = User::factory()->organizer()->create();
        Sanctum::actingAs($organizer);

        $response = $this->postJson('/api/events', [
            'title' => 'New Event',
            'description' => 'Event description',
            'location' => 'Main Hall',
            'event_date' => now()->addWeek()->toDateTimeString(),
            'vacancies' => 50,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'New Event',
                    'status' => EventStatus::Pending->value,
                ],
            ]);
    }

    public function test_participant_cannot_create_event(): void
    {
        $participant = User::factory()->participant()->create();
        Sanctum::actingAs($participant);

        $response = $this->postJson('/api/events', [
            'title' => 'New Event',
            'description' => 'Event description',
            'location' => 'Main Hall',
            'event_date' => now()->addWeek()->toDateTimeString(),
            'vacancies' => 50,
        ]);

        $response->assertForbidden();
    }

    public function test_organizer_can_update_own_event(): void
    {
        $organizer = User::factory()->organizer()->create();
        $event = Event::factory()->create(['organizer_id' => $organizer->id]);
        Sanctum::actingAs($organizer);

        $response = $this->putJson("/api/events/{$event->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Title');
    }

    public function test_organizer_cannot_update_other_organizer_event(): void
    {
        $organizer = User::factory()->organizer()->create();
        $otherOrganizer = User::factory()->organizer()->create();
        $event = Event::factory()->create(['organizer_id' => $otherOrganizer->id]);
        Sanctum::actingAs($organizer);

        $response = $this->putJson("/api/events/{$event->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_approve_event(): void
    {
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->pending()->create();
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/events/{$event->id}", [
            'status' => EventStatus::Approved->value,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', EventStatus::Approved->value);
    }

    public function test_organizer_can_delete_own_event(): void
    {
        $organizer = User::factory()->organizer()->create();
        $event = Event::factory()->create(['organizer_id' => $organizer->id]);
        Sanctum::actingAs($organizer);

        $response = $this->deleteJson("/api/events/{$event->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }
}
