<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): array
    {
        return $this->createUser($data, UserRole::Participant);
    }

    public function registerOrganizer(array $data): array
    {
        return $this->createUser([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'department' => $data['department'],
        ], UserRole::Organizer);
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update(collect($data)->only(['name', 'course', 'department'])->filter()->all());

        return $user->fresh();
    }

    private function createUser(array $data, UserRole $role): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $role,
            'course' => $data['course'] ?? null,
            'department' => $data['department'] ?? null,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function login(array $credentials): ?array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return null;
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
