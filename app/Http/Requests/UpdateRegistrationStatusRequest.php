<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegistrationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $registration = $this->route('registration');

        if (! $registration) {
            return false;
        }

        $registration->loadMissing('event');

        return $this->user()?->can('manageRegistration', $registration->event) ?? false;
    }

    public function rules(): array
    {
        return [];
    }
}
