<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $event && $this->user()?->can('cancelRegistration', $event);
    }

    public function rules(): array
    {
        return [];
    }
}
