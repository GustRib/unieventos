<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/register/organizer', [AuthController::class, 'registerOrganizer']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);

    Route::get('/my-registrations', [RegistrationController::class, 'myRegistrations']);

    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    Route::post('/events/{event}/register', [RegistrationController::class, 'store']);
    Route::delete('/events/{event}/register', [RegistrationController::class, 'destroy']);
    Route::get('/events/{event}/registrations', [RegistrationController::class, 'index']);
    Route::patch('/registrations/{registration}/approve', [RegistrationController::class, 'approve']);
    Route::patch('/registrations/{registration}/reject', [RegistrationController::class, 'reject']);

    Route::post('/events/{event}/feedback', [FeedbackController::class, 'store']);
    Route::get('/events/{event}/feedbacks', [FeedbackController::class, 'index']);
});
