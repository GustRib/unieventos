<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelRegistrationRequest;
use App\Http\Requests\RegisterEventRequest;
use App\Http\Resources\RegistrationResource;
use App\Models\Event;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;

class RegistrationController extends Controller
{
    public function __construct(
        private readonly RegistrationService $registrationService
    ) {}

    public function store(RegisterEventRequest $request, Event $event): JsonResponse
    {
        $registration = $this->registrationService->register($request->user(), $event);

        return $this->success(
            new RegistrationResource($registration),
            'Registration completed successfully',
            201
        );
    }

    public function destroy(CancelRegistrationRequest $request, Event $event): JsonResponse
    {
        $this->registrationService->cancel($request->user(), $event);

        return $this->success(null, 'Registration cancelled successfully');
    }

    public function index(Event $event): JsonResponse
    {
        $this->authorize('viewRegistrations', $event);

        $registrations = $this->registrationService->listForEvent($event);

        return $this->success(RegistrationResource::collection($registrations));
    }
}
