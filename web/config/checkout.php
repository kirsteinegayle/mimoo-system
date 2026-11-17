<?php

return [
    /*
    | Maximum quantity of a single product a buyer may purchase in one checkout.
    | Single source of truth: used by the web cart/checkout, the buyer API
    | (Flutter app) and exposed to the front-ends as `max_per_checkout`.
    */
    'max_quantity_per_product' => (int) env('CHECKOUT_MAX_QTY_PER_PRODUCT', 10),
];
