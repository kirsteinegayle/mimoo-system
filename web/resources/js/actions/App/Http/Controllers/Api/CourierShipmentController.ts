import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierShipmentController::index
 * @see app/Http/Controllers/Api/CourierShipmentController.php:17
 * @route '/api/courier-app/shipments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/shipments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierShipmentController::index
 * @see app/Http/Controllers/Api/CourierShipmentController.php:17
 * @route '/api/courier-app/shipments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierShipmentController::index
 * @see app/Http/Controllers/Api/CourierShipmentController.php:17
 * @route '/api/courier-app/shipments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierShipmentController::index
 * @see app/Http/Controllers/Api/CourierShipmentController.php:17
 * @route '/api/courier-app/shipments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierShipmentController::index
 * @see app/Http/Controllers/Api/CourierShipmentController.php:17
 * @route '/api/courier-app/shipments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierShipmentController::index
 * @see app/Http/Controllers/Api/CourierShipmentController.php:17
 * @route '/api/courier-app/shipments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierShipmentController::index
 * @see app/Http/Controllers/Api/CourierShipmentController.php:17
 * @route '/api/courier-app/shipments'
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
* @see \App\Http\Controllers\Api\CourierShipmentController::show
 * @see app/Http/Controllers/Api/CourierShipmentController.php:57
 * @route '/api/courier-app/shipments/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/shipments/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierShipmentController::show
 * @see app/Http/Controllers/Api/CourierShipmentController.php:57
 * @route '/api/courier-app/shipments/{id}'
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
* @see \App\Http\Controllers\Api\CourierShipmentController::show
 * @see app/Http/Controllers/Api/CourierShipmentController.php:57
 * @route '/api/courier-app/shipments/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierShipmentController::show
 * @see app/Http/Controllers/Api/CourierShipmentController.php:57
 * @route '/api/courier-app/shipments/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierShipmentController::show
 * @see app/Http/Controllers/Api/CourierShipmentController.php:57
 * @route '/api/courier-app/shipments/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierShipmentController::show
 * @see app/Http/Controllers/Api/CourierShipmentController.php:57
 * @route '/api/courier-app/shipments/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierShipmentController::show
 * @see app/Http/Controllers/Api/CourierShipmentController.php:57
 * @route '/api/courier-app/shipments/{id}'
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
* @see \App\Http\Controllers\Api\CourierShipmentController::accept
 * @see app/Http/Controllers/Api/CourierShipmentController.php:112
 * @route '/api/courier-app/shipments/{id}/accept'
 */
export const accept = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/api/courier-app/shipments/{id}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierShipmentController::accept
 * @see app/Http/Controllers/Api/CourierShipmentController.php:112
 * @route '/api/courier-app/shipments/{id}/accept'
 */
accept.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return accept.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierShipmentController::accept
 * @see app/Http/Controllers/Api/CourierShipmentController.php:112
 * @route '/api/courier-app/shipments/{id}/accept'
 */
accept.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierShipmentController::accept
 * @see app/Http/Controllers/Api/CourierShipmentController.php:112
 * @route '/api/courier-app/shipments/{id}/accept'
 */
    const acceptForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: accept.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierShipmentController::accept
 * @see app/Http/Controllers/Api/CourierShipmentController.php:112
 * @route '/api/courier-app/shipments/{id}/accept'
 */
        acceptForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: accept.url(args, options),
            method: 'post',
        })
    
    accept.form = acceptForm
/**
* @see \App\Http\Controllers\Api\CourierShipmentController::reject
 * @see app/Http/Controllers/Api/CourierShipmentController.php:146
 * @route '/api/courier-app/shipments/{id}/reject'
 */
export const reject = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/api/courier-app/shipments/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierShipmentController::reject
 * @see app/Http/Controllers/Api/CourierShipmentController.php:146
 * @route '/api/courier-app/shipments/{id}/reject'
 */
reject.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierShipmentController::reject
 * @see app/Http/Controllers/Api/CourierShipmentController.php:146
 * @route '/api/courier-app/shipments/{id}/reject'
 */
reject.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierShipmentController::reject
 * @see app/Http/Controllers/Api/CourierShipmentController.php:146
 * @route '/api/courier-app/shipments/{id}/reject'
 */
    const rejectForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierShipmentController::reject
 * @see app/Http/Controllers/Api/CourierShipmentController.php:146
 * @route '/api/courier-app/shipments/{id}/reject'
 */
        rejectForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
const CourierShipmentController = { index, show, accept, reject }

export default CourierShipmentController