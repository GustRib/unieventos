<?php

use App\Http\Controllers\ApiDocumentationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/docs/openapi.yaml', ApiDocumentationController::class);

Route::get('/docs', function () {
    return view('swagger');
});
