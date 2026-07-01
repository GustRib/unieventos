<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Resources\FeedbackResource;
use App\Models\Event;
use App\Services\FeedbackService;
use Illuminate\Http\JsonResponse;

class FeedbackController extends Controller
{
    public function __construct(
        private readonly FeedbackService $feedbackService
    ) {}

    public function store(StoreFeedbackRequest $request, Event $event): JsonResponse
    {
        $feedback = $this->feedbackService->store($request->user(), $event, $request->validated());

        return $this->success(
            new FeedbackResource($feedback),
            'Feedback submitted successfully',
            201
        );
    }

    public function index(Event $event): JsonResponse
    {
        $this->authorize('viewFeedbacks', $event);

        $feedbacks = $this->feedbackService->listForEvent($event);

        return $this->success(FeedbackResource::collection($feedbacks));
    }
}
