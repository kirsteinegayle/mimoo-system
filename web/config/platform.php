<?php

return [
    /*
    | Platform commission charged on seller sales (ERP components doc: Admin →
    | "Manage Commission (10%)"). One value used by the admin dashboard and the
    | Generate Reports feature.
    */
    'commission_rate' => (float) env('PLATFORM_COMMISSION_RATE', 0.10),

    /*
    | An unfinished sign-up (email never verified, still pending) older than this many minutes counts as
    | abandoned: a new sign-up with the same email / mobile number replaces it. Same-password retries replace it at once.
    */
    'abandoned_registration_minutes' => (int) env('ABANDONED_REGISTRATION_MINUTES', 30),
];
