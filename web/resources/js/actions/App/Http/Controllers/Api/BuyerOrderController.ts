import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkout
 * @see app/Http/Controllers/Api/BuyerOrderController.php:136
 * @route '/api/buyer/checkout'
 */
export const checkout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

checkout.definition = {
    methods: ["post"],
    url: '/api/buyer/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkout
 * @see app/Http/Controllers/Api/BuyerOrderController.php:136
 * @route '/api/buyer/checkout'
 */
checkout.url = (options?: RouteQueryOptions) => {
    return checkout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkout
 * @see app/Http/Controllers/Api/BuyerOrderController.php:136
 * @route '/api/buyer/checkout'
 */
checkout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkout
 * @see app/Http/Controllers/Api/BuyerOrderController.php:136
 * @route '/api/buyer/checkout'
 */
    const checkoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: checkout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkout
 * @see app/Http/Controllers/Api/BuyerOrderController.php:136
 * @route '/api/buyer/checkout'
 */
        checkoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: checkout.url(options),
            method: 'post',
        })
    
    checkout.form = checkoutForm
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkoutPreview
 * @see app/Http/Controllers/Api/BuyerOrderController.php:410
 * @route '/api/buyer/checkout/preview'
 */
export const checkoutPreview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkoutPreview.url(options),
    method: 'post',
})

checkoutPreview.definition = {
    methods: ["post"],
    url: '/api/buyer/checkout/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkoutPreview
 * @see app/Http/Controllers/Api/BuyerOrderController.php:410
 * @route '/api/buyer/checkout/preview'
 */
checkoutPreview.url = (options?: RouteQueryOptions) => {
    return checkoutPreview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkoutPreview
 * @see app/Http/Controllers/Api/BuyerOrderController.php:410
 * @route '/api/buyer/checkout/preview'
 */
checkoutPreview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkoutPreview.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkoutPreview
 * @see app/Http/Controllers/Api/BuyerOrderController.php:410
 * @route '/api/buyer/checkout/preview'
 */
    const checkoutPreviewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: checkoutPreview.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::checkoutPreview
 * @see app/Http/Controllers/Api/BuyerOrderController.php:410
 * @route '/api/buyer/checkout/preview'
 */
        checkoutPreviewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: checkoutPreview.url(options),
            method: 'post',
        })
    
    checkoutPreview.form = checkoutPreviewForm
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::index
 * @see app/Http/Controllers/Api/BuyerOrderController.php:488
 * @route '/api/buyer/orders'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::index
 * @see app/Http/Controllers/Api/BuyerOrderController.php:488
 * @route '/api/buyer/orders'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::index
 * @see app/Http/Controllers/Api/BuyerOrderController.php:488
 * @route '/api/buyer/orders'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::index
 * @see app/Http/Controllers/Api/BuyerOrderController.php:488
 * @route '/api/buyer/orders'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerOrderController::index
 * @see app/Http/Controllers/Api/BuyerOrderController.php:488
 * @route '/api/buyer/orders'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::index
 * @see app/Http/Controllers/Api/BuyerOrderController.php:488
 * @route '/api/buyer/orders'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::index
 * @see app/Http/Controllers/Api/BuyerOrderController.php:488
 * @route '/api/buyer/orders'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::show
 * @see app/Http/Controllers/Api/BuyerOrderController.php:518
 * @route '/api/buyer/orders/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::show
 * @see app/Http/Controllers/Api/BuyerOrderController.php:518
 * @route '/api/buyer/orders/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::show
 * @see app/Http/Controllers/Api/BuyerOrderController.php:518
 * @route '/api/buyer/orders/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::show
 * @see app/Http/Controllers/Api/BuyerOrderController.php:518
 * @route '/api/buyer/orders/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerOrderController::show
 * @see app/Http/Controllers/Api/BuyerOrderController.php:518
 * @route '/api/buyer/orders/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::show
 * @see app/Http/Controllers/Api/BuyerOrderController.php:518
 * @route '/api/buyer/orders/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::show
 * @see app/Http/Controllers/Api/BuyerOrderController.php:518
 * @route '/api/buyer/orders/{id}'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::cancel
 * @see app/Http/Controllers/Api/BuyerOrderController.php:587
 * @route '/api/buyer/orders/{id}/cancel'
 */
export const cancel = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::cancel
 * @see app/Http/Controllers/Api/BuyerOrderController.php:587
 * @route '/api/buyer/orders/{id}/cancel'
 */
cancel.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return cancel.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::cancel
 * @see app/Http/Controllers/Api/BuyerOrderController.php:587
 * @route '/api/buyer/orders/{id}/cancel'
 */
cancel.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerOrderController::cancel
 * @see app/Http/Controllers/Api/BuyerOrderController.php:587
 * @route '/api/buyer/orders/{id}/cancel'
 */
    const cancelForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::cancel
 * @see app/Http/Controllers/Api/BuyerOrderController.php:587
 * @route '/api/buyer/orders/{id}/cancel'
 */
        cancelForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\Api\BuyerOrderController::receive
 * @see app/Http/Controllers/Api/BuyerOrderController.php:540
 * @route '/api/buyer/orders/{id}/receive'
 */
export const receive = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receive.url(args, options),
    method: 'post',
})

receive.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/receive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::receive
 * @see app/Http/Controllers/Api/BuyerOrderController.php:540
 * @route '/api/buyer/orders/{id}/receive'
 */
receive.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return receive.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerOrderController::receive
 * @see app/Http/Controllers/Api/BuyerOrderController.php:540
 * @route '/api/buyer/orders/{id}/receive'
 */
receive.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerOrderController::receive
 * @see app/Http/Controllers/Api/BuyerOrderController.php:540
 * @route '/api/buyer/orders/{id}/receive'
 */
    const receiveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: receive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerOrderController::receive
 * @see app/Http/Controllers/Api/BuyerOrderController.php:540
 * @route '/api/buyer/orders/{id}/receive'
 */
        receiveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: receive.url(args, options),
            method: 'post',
        })
    
    receive.form = receiveForm
const BuyerOrderController = { checkout, checkoutPreview, index, show, cancel, receive }

export default BuyerOrderController