import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::index
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/courier/incoming-shipments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::index
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::index
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::index
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::index
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::index
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::index
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
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
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::show
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:211
 * @route '/api/courier/shipments/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/courier/shipments/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::show
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:211
 * @route '/api/courier/shipments/{id}'
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
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::show
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:211
 * @route '/api/courier/shipments/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::show
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:211
 * @route '/api/courier/shipments/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::show
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:211
 * @route '/api/courier/shipments/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::show
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:211
 * @route '/api/courier/shipments/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::show
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:211
 * @route '/api/courier/shipments/{id}'
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
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::accept
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:340
 * @route '/api/courier/shipments/{id}/accept'
 */
export const accept = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/api/courier/shipments/{id}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::accept
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:340
 * @route '/api/courier/shipments/{id}/accept'
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
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::accept
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:340
 * @route '/api/courier/shipments/{id}/accept'
 */
accept.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::accept
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:340
 * @route '/api/courier/shipments/{id}/accept'
 */
    const acceptForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: accept.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::accept
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:340
 * @route '/api/courier/shipments/{id}/accept'
 */
        acceptForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: accept.url(args, options),
            method: 'post',
        })
    
    accept.form = acceptForm
/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::reject
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:384
 * @route '/api/courier/shipments/{id}/reject'
 */
export const reject = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/api/courier/shipments/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::reject
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:384
 * @route '/api/courier/shipments/{id}/reject'
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
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::reject
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:384
 * @route '/api/courier/shipments/{id}/reject'
 */
reject.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::reject
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:384
 * @route '/api/courier/shipments/{id}/reject'
 */
    const rejectForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::reject
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:384
 * @route '/api/courier/shipments/{id}/reject'
 */
        rejectForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
const IncomingShipmentsController = { index, show, accept, reject }

export default IncomingShipmentsController