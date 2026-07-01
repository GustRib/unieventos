<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Event::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $eventDate = $this->input('event_date');

        if (is_string($eventDate) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $eventDate)) {
            $this->merge(['event_date' => $eventDate.':00']);
        }

        if (! $this->filled('location')) {
            $this->merge(['location' => 'A definir']);
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date', 'after:now'],
            'vacancies' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'O nome do evento é obrigatório.',
            'description.required' => 'A descrição é obrigatória.',
            'event_date.required' => 'A data do evento é obrigatória.',
            'event_date.date' => 'A data do evento é inválida.',
            'event_date.after' => 'A data do evento deve ser no futuro.',
            'vacancies.required' => 'O número de vagas é obrigatório.',
            'vacancies.integer' => 'O número de vagas deve ser um valor inteiro.',
            'vacancies.min' => 'Deve existir pelo menos 1 vaga.',
        ];
    }
}
