<?php

return [

    /*
    | Refund driver. "manual" (default): the admin marks the refund as processed
    | and types the reference, no gateway is called. "fake": deterministic
    | in-memory driver for tests. A real gateway driver does not exist: the
    | project has no payment gateway integration, no refund API and no sandbox
    | credentials (see the release notes), so nothing here can reach a gateway.
    */
    'driver' => env('REFUND_DRIVER', 'manual'),

    'drivers' => [
        'manual' => \App\Services\Refund\ManualRefundDriver::class,
        'fake'   => \App\Services\Refund\FakeRefundDriver::class,
    ],

    /*
    | Put the refunded items back into stock. OFF by default. The flag exists
    | but restocking is NOT implemented yet (needs per-variant stock, stock_logs
    | entries and a "returned in good condition" decision per item).
    */
    'return_stock' => (bool) env('REFUND_RETURN_STOCK', false),

    /*
    | orders.payment_status is a free varchar: "unpaid" / "paid" from checkout and COD, and
    | "refunded" (written ONLY when a refund is marked refunded, once, in the same transaction).
    | Every reader treats "refunded" as already paid (nothing is owed or collected again).
    | The value is only written when it is in this list.
    */
    'known_payment_statuses' => ['unpaid', 'paid', 'refunded'],
    'payment_status_on_refund' => 'refunded',
];
