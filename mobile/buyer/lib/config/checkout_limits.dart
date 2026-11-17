/// Max quantity of one product per checkout. Mirrors the server value
/// (config/checkout.php → CHECKOUT_MAX_QTY_PER_PRODUCT); the server is the
/// source of truth and rejects anything higher with a clear message.
const int kMaxQtyPerCheckout = 10;
