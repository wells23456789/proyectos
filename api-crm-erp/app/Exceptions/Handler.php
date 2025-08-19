<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Http\JsonResponse;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        // Si la petición espera JSON, devuelvo JSON con el mensaje y código
        if ($request->wantsJson()) {
            $status = method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;

            return response()->json([
                'error' => true,
                'message' => $exception->getMessage(),
            ], $status);
        }

        // En caso contrario, render normal (página HTML)
        return parent::render($request, $exception);
    }
}
