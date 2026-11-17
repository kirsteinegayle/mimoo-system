import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
const buyerOrderPhotoa8ed74781f17350d93149ca8254ff778 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.url(args, options),
    method: 'get',
})

buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}/pod-photo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
    const buyerOrderPhotoa8ed74781f17350d93149ca8254ff778Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
        buyerOrderPhotoa8ed74781f17350d93149ca8254ff778Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
        buyerOrderPhotoa8ed74781f17350d93149ca8254ff778Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerOrderPhotoa8ed74781f17350d93149ca8254ff778.form = buyerOrderPhotoa8ed74781f17350d93149ca8254ff778Form
    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/orders/{id}/pod-photo'
 */
const buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.url(args, options),
    method: 'get',
})

buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.definition = {
    methods: ["get","head"],
    url: '/api/orders/{id}/pod-photo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/orders/{id}/pod-photo'
 */
buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/orders/{id}/pod-photo'
 */
buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/orders/{id}/pod-photo'
 */
buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/orders/{id}/pod-photo'
 */
    const buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5aForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/orders/{id}/pod-photo'
 */
        buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5aForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:96
 * @route '/api/orders/{id}/pod-photo'
 */
        buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5aForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a.form = buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5aForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buyerOrderPhoto['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buyerOrderPhoto = {
    '/api/buyer/orders/{id}/pod-photo': buyerOrderPhotoa8ed74781f17350d93149ca8254ff778,
    '/api/orders/{id}/pod-photo': buyerOrderPhoto581a8f42a012a1fb6f9efd2f9ad6aa5a,
}

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/delivery-jobs/{id}/pod-photo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
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
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
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
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::showWeb
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
export const showWeb = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showWeb.url(args, options),
    method: 'get',
})

showWeb.definition = {
    methods: ["get","head"],
    url: '/pod/{id}/photo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::showWeb
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
showWeb.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showWeb.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::showWeb
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
showWeb.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showWeb.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::showWeb
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
showWeb.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showWeb.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::showWeb
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
    const showWebForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showWeb.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::showWeb
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
        showWebForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showWeb.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::showWeb
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
        showWebForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showWeb.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showWeb.form = showWebForm
const DeliveryPodPhotoController = { buyerOrderPhoto, show, showWeb }

export default DeliveryPodPhotoController