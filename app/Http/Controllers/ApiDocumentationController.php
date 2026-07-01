<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ApiDocumentationController extends Controller
{
    public function __invoke(): SymfonyResponse
    {
        $path = base_path('docs/openapi.yaml');

        if (! file_exists($path)) {
            abort(404, 'OpenAPI specification not found.');
        }

        return response(file_get_contents($path), Response::HTTP_OK, [
            'Content-Type' => 'application/yaml',
        ]);
    }
}
