<?php

namespace App\Http\Requests;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $event && $this->user()?->can('update', $event);
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'location' => ['sometimes', 'string', 'max:255'],
            'event_date' => ['sometimes', 'date', 'after:now'],
            'vacancies' => ['sometimes', 'integer', 'min:1'],
        ];

        if ($this->user()?->role === UserRole::Admin) {
            $rules['status'] = ['sometimes', Rule::enum(EventStatus::class)];
        }

        return $rules;
    }
}
