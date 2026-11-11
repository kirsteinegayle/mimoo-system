import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerReviewController::productReviews
 * @see app/Http/Controllers/Api/BuyerReviewController.php:193
 * @route '/api/buyer/products/{id}/reviews'
 */
export const productReviews = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productReviews.url(args, options),
    method: 'get',
})

productReviews.definition = {
    methods: ["get","head"],
    url: '/api/buyer/products/{id}/reviews',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::productReviews
 * @see app/Http/Controllers/Api/BuyerReviewController.php:193
 * @route '/api/buyer/products/{id}/reviews'
 */
productReviews.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return productReviews.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::productReviews
 * @see app/Http/Controllers/Api/BuyerReviewController.php:193
 * @route '/api/buyer/products/{id}/reviews'
 */
productReviews.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productReviews.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReviewController::productReviews
 * @see app/Http/Controllers/Api/BuyerReviewController.php:193
 * @route '/api/buyer/products/{id}/reviews'
 */
productReviews.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: productReviews.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::productReviews
 * @see app/Http/Controllers/Api/BuyerReviewController.php:193
 * @route '/api/buyer/products/{id}/reviews'
 */
    const productReviewsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: productReviews.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::productReviews
 * @see app/Http/Controllers/Api/BuyerReviewController.php:193
 * @route '/api/buyer/products/{id}/reviews'
 */
        productReviewsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productReviews.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::productReviews
 * @see app/Http/Controllers/Api/BuyerReviewController.php:193
 * @route '/api/buyer/products/{id}/reviews'
 */
        productReviewsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productReviews.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    productReviews.form = productReviewsForm
/**
* @see \App\Http\Controllers\Api\BuyerReviewController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReviewController.php:228
 * @route '/api/buyer/review-photo/{filename}'
 */
export const servePhoto = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})

servePhoto.definition = {
    methods: ["get","head"],
    url: '/api/buyer/review-photo/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReviewController.php:228
 * @route '/api/buyer/review-photo/{filename}'
 */
servePhoto.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return servePhoto.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReviewController.php:228
 * @route '/api/buyer/review-photo/{filename}'
 */
servePhoto.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReviewController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReviewController.php:228
 * @route '/api/buyer/review-photo/{filename}'
 */
servePhoto.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: servePhoto.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReviewController.php:228
 * @route '/api/buyer/review-photo/{filename}'
 */
    const servePhotoForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: servePhoto.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReviewController.php:228
 * @route '/api/buyer/review-photo/{filename}'
 */
        servePhotoForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReviewController.php:228
 * @route '/api/buyer/review-photo/{filename}'
 */
        servePhotoForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    servePhoto.form = servePhotoForm
/**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
const store995509ed2817248c8a46f482b82502d4 = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store995509ed2817248c8a46f482b82502d4.url(args, options),
    method: 'post',
})

store995509ed2817248c8a46f482b82502d4.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{orderId}/items/{itemId}/review',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
store995509ed2817248c8a46f482b82502d4.url = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    orderId: args[0],
                    itemId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        orderId: args.orderId,
                                itemId: args.itemId,
                }

    return store995509ed2817248c8a46f482b82502d4.definition.url
            .replace('{orderId}', parsedArgs.orderId.toString())
            .replace('{itemId}', parsedArgs.itemId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
store995509ed2817248c8a46f482b82502d4.post = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store995509ed2817248c8a46f482b82502d4.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
    const store995509ed2817248c8a46f482b82502d4Form = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store995509ed2817248c8a46f482b82502d4.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
        store995509ed2817248c8a46f482b82502d4Form.post = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store995509ed2817248c8a46f482b82502d4.url(args, options),
            method: 'post',
        })
    
    store995509ed2817248c8a46f482b82502d4.form = store995509ed2817248c8a46f482b82502d4Form
    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/buyer/orders/{orderId}/items/{itemId}/review'
 */
const store983cf0c587d548d183c0c5680960d5d0 = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store983cf0c587d548d183c0c5680960d5d0.url(args, options),
    method: 'post',
})

store983cf0c587d548d183c0c5680960d5d0.definition = {
    methods: ["post"],
    url: '/buyer/orders/{orderId}/items/{itemId}/review',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/buyer/orders/{orderId}/items/{itemId}/review'
 */
store983cf0c587d548d183c0c5680960d5d0.url = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    orderId: args[0],
                    itemId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        orderId: args.orderId,
                                itemId: args.itemId,
                }

    return store983cf0c587d548d183c0c5680960d5d0.definition.url
            .replace('{orderId}', parsedArgs.orderId.toString())
            .replace('{itemId}', parsedArgs.itemId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/buyer/orders/{orderId}/items/{itemId}/review'
 */
store983cf0c587d548d183c0c5680960d5d0.post = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store983cf0c587d548d183c0c5680960d5d0.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/buyer/orders/{orderId}/items/{itemId}/review'
 */
    const store983cf0c587d548d183c0c5680960d5d0Form = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store983cf0c587d548d183c0c5680960d5d0.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/buyer/orders/{orderId}/items/{itemId}/review'
 */
        store983cf0c587d548d183c0c5680960d5d0Form.post = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store983cf0c587d548d183c0c5680960d5d0.url(args, options),
            method: 'post',
        })
    
    store983cf0c587d548d183c0c5680960d5d0.form = store983cf0c587d548d183c0c5680960d5d0Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerReviewController::store, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `store['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const store = {
    '/api/buyer/orders/{orderId}/items/{itemId}/review': store995509ed2817248c8a46f482b82502d4,
    '/buyer/orders/{orderId}/items/{itemId}/review': store983cf0c587d548d183c0c5680960d5d0,
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
const updateda7a4af9c09529bfc715df7a59d1ec84 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateda7a4af9c09529bfc715df7a59d1ec84.url(args, options),
    method: 'put',
})

updateda7a4af9c09529bfc715df7a59d1ec84.definition = {
    methods: ["put"],
    url: '/api/buyer/reviews/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
updateda7a4af9c09529bfc715df7a59d1ec84.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateda7a4af9c09529bfc715df7a59d1ec84.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
updateda7a4af9c09529bfc715df7a59d1ec84.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateda7a4af9c09529bfc715df7a59d1ec84.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
    const updateda7a4af9c09529bfc715df7a59d1ec84Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateda7a4af9c09529bfc715df7a59d1ec84.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
        updateda7a4af9c09529bfc715df7a59d1ec84Form.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateda7a4af9c09529bfc715df7a59d1ec84.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateda7a4af9c09529bfc715df7a59d1ec84.form = updateda7a4af9c09529bfc715df7a59d1ec84Form
    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/buyer/reviews/{id}'
 */
const updatef078704e6a349b5990fe8179723e8e08 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatef078704e6a349b5990fe8179723e8e08.url(args, options),
    method: 'put',
})

updatef078704e6a349b5990fe8179723e8e08.definition = {
    methods: ["put"],
    url: '/buyer/reviews/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/buyer/reviews/{id}'
 */
updatef078704e6a349b5990fe8179723e8e08.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updatef078704e6a349b5990fe8179723e8e08.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/buyer/reviews/{id}'
 */
updatef078704e6a349b5990fe8179723e8e08.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatef078704e6a349b5990fe8179723e8e08.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/buyer/reviews/{id}'
 */
    const updatef078704e6a349b5990fe8179723e8e08Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatef078704e6a349b5990fe8179723e8e08.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/buyer/reviews/{id}'
 */
        updatef078704e6a349b5990fe8179723e8e08Form.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatef078704e6a349b5990fe8179723e8e08.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatef078704e6a349b5990fe8179723e8e08.form = updatef078704e6a349b5990fe8179723e8e08Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerReviewController::update, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `update['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const update = {
    '/api/buyer/reviews/{id}': updateda7a4af9c09529bfc715df7a59d1ec84,
    '/buyer/reviews/{id}': updatef078704e6a349b5990fe8179723e8e08,
}

const BuyerReviewController = { productReviews, servePhoto, store, update }

export default BuyerReviewController