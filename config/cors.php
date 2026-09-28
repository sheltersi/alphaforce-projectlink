<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The Organisation App API is consumed directly by the separate Next.js
    | organisation frontend using stateless Sanctum Bearer tokens. Only the
    | exact frontend origins below may call the API. Credentials (cookies)
    | are intentionally disabled — authentication travels in the
    | Authorization header, not in cookies.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Next.js dev server.
        'http://localhost:3000',
        // Next.js frontend served through Valet.
        'https://orangepie.test',
        'http://orangepie.test',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
