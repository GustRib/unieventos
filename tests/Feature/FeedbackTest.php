<?php

namespace Tests\Feature;

use App\Enums\RegistrationStatus;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_registered_participant_can_submit_feedback(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create();

        Registration::factory()->create([
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'status' => RegistrationStatus::Approved,
        ]);

        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/events/{$event->id}/feedback", [
            'rating' => 5,
            'comment' => 'Excellent event!',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'rating' => 5,
                    'comment' => 'Excellent event!',
                ],
            ]);
    }

    public function test_unregistered_user_cannot_submit_feedback(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create();
        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/events/{$event->id}/feedback", [
            'rating' => 4,
            'comment' => 'Good event',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Only registered participants can submit feedback.',
            ]);
    }

    public function test_participant_cannot_submit_duplicate_feedback(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create();

        Registration::factory()->create([
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'status' => RegistrationStatus::Approved,
        ]);

        Feedback::factory()->create([
            'user_id' => $participant->id,
            'event_id' => $event->id,
        ]);

        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/events/{$event->id}/feedback", [
            'rating' => 3,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'You have already submitted feedback for this event.',
            ]);
    }

    public function test_anyone_can_view_feedbacks_for_approved_event(): void
    {
        $event = Event::factory()->approved()->create();
        Feedback::factory()->count(3)->create(['event_id' => $event->id]);

        $response = $this->getJson("/api/events/{$event->id}/feedbacks");

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_feedback_rating_must_be_between_one_and_five(): void
    {
        $participant = User::factory()->participant()->create();
        $event = Event::factory()->approved()->create();

        Registration::factory()->create([
            'user_id' => $participant->id,
            'event_id' => $event->id,
            'status' => RegistrationStatus::Approved,
        ]);

        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/events/{$event->id}/feedback", [
            'rating' => 6,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed',
            ]);
    }
}
