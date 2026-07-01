<?php

namespace App\Providers;

use App\Models\Event;
use App\Models\Feedback;
use App\Policies\EventPolicy;
use App\Policies\FeedbackPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        Event::class => EventPolicy::class,
        Feedback::class => FeedbackPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(Feedback::class, FeedbackPolicy::class);
    }
}
