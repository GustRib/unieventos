<?php

namespace Database\Seeders;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@unieventos.com',
            'password' => '123456',
            'role' => 'admin',
            'department' => 'TI',
        ]);

        $organizer = User::create([
            'name' => 'Organizador Demo',
            'email' => 'organizer@unieventos.com',
            'password' => '123456',
            'role' => 'organizer',
            'department' => 'Eventos',
        ]);

        User::create([
            'name' => 'Participante Demo',
            'email' => 'participant@unieventos.com',
            'password' => '123456',
            'role' => 'participant',
            'course' => 'Engenharia de Software',
            'department' => 'Computação',
        ]);

        Event::create([
            'title' => 'Semana da Tecnologia',
            'description' => 'Palestras e workshops sobre inovação e tecnologia.',
            'location' => 'Auditório Central',
            'event_date' => now()->addWeeks(2),
            'vacancies' => 100,
            'available_vacancies' => 100,
            'status' => EventStatus::Approved,
            'organizer_id' => $organizer->id,
        ]);

        Event::create([
            'title' => 'Feira de Ciências',
            'description' => 'Exposição de projetos científicos dos estudantes.',
            'location' => 'Campus Norte',
            'event_date' => now()->addWeeks(4),
            'vacancies' => 50,
            'available_vacancies' => 50,
            'status' => EventStatus::Pending,
            'organizer_id' => $organizer->id,
        ]);

        Event::create([
            'title' => 'Workshop de Carreira',
            'description' => 'Orientações sobre mercado de trabalho e currículo.',
            'location' => 'Sala 201',
            'event_date' => now()->addWeeks(3),
            'vacancies' => 30,
            'available_vacancies' => 30,
            'status' => EventStatus::Approved,
            'organizer_id' => $organizer->id,
        ]);
    }
}
