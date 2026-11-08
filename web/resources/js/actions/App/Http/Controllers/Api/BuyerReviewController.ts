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
export const store = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{orderId}/items/{itemId}/review',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
store.url = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{orderId}', parsedArgs.orderId.toString())
            .replace('{itemId}', parsedArgs.itemId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
store.post = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
    const storeForm = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReviewController::store
 * @see app/Http/Controllers/Api/BuyerReviewController.php:106
 * @route '/api/buyer/orders/{orderId}/items/{itemId}/review'
 */
        storeForm.post = (args: { orderId: string | number, itemId: string | number } | [orderId: string | number, itemId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/buyer/reviews/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReviewController::update
 * @see app/Http/Controllers/Api/BuyerReviewController.php:155
 * @route '/api/buyer/reviews/{id}'
 */
    const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
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
        updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const BuyerReviewController = { productReviews, servePhoto, store, update }

export default BuyerReviewController