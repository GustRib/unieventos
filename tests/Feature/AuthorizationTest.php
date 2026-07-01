<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_cannot_view_registrations(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create();
        Sanctum::actingAs($participant);

        $response = $this->getJson("/api/events/{$event->id}/registrations");

        $response->assertForbidden();
    }

    public function test_organizer_cannot_view_other_organizer_registrations(): void
    {
        $organizer = User::factory()->organizer()->create();
        $otherOrganizer = User::factory()->organizer()->create();
        $event = Event::factory()->approved()->create(['organizer_id' => $otherOrganizer->id]);
        Sanctum::actingAs($organizer);

        $response = $this->getJson("/api/events/{$event->id}/registrations");

        $response->assertForbidden();
    }

    public function test_admin_can_view_any_event_registrations(): void
    {
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->approved()->create();
        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/events/{$event->id}/registrations");

        $response->assertOk();
    }

    public function test_organizer_cannot_change_event_status(): void
    {
        $organizer = User::factory()->organizer()->create();
        $event = Event::factory()->pending()->create(['organizer_id' => $organizer->id]);
        Sanctum::actingAs($organizer);

        $response = $this->putJson("/api/events/{$event->id}", [
            'status' => 'approved',
        ]);

        $response->assertOk();
        $this->assertEquals('pending', $event->fresh()->status->value);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $event = Event::factory()->approved()->create();

        $this->postJson('/api/logout')->assertUnauthorized();
        $this->getJson('/api/me')->assertUnauthorized();
        $this->postJson('/api/events')->assertUnauthorized();
        $this->postJson("/api/events/{$event->id}/register")->assertUnauthorized();
    }
}
