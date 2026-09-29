<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_login_and_get_sanctum_token(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'demo@evently.app',
            'password' => 'Test1234!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                ],
            ]);
    }

    public function test_can_get_events_list_and_categories(): void
    {
        $response = $this->getJson('/api/events');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'title', 'location', 'price', 'category'],
                ],
                'meta' => ['total', 'page', 'limit', 'totalPages'],
            ]);

        $catResponse = $this->getJson('/api/events/categories');
        $catResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'icon', 'color', '_count' => ['events']],
                ],
            ]);
    }

    public function test_can_get_single_event_and_favorites(): void
    {
        $user = User::where('email', 'demo@evently.app')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $event = Event::first();

        // Get single event
        $eventRes = $this->getJson("/api/events/{$event->id}");
        $eventRes->assertStatus(200)->assertJson(['success' => true]);

        // Get favorites
        $favRes = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/favorites');
        $favRes->assertStatus(200)->assertJson(['success' => true]);

        // Get tickets
        $ticketRes = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/tickets');
        $ticketRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['all', 'active', 'past'],
            ]);
    }
}
