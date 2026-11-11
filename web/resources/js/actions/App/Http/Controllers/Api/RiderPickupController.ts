import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RiderPickupController::index
 * @see app/Http/Controllers/Api/RiderPickupController.php:38
 * @route '/api/rider-app/pickups'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/pickups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderPickupController::index
 * @see app/Http/Controllers/Api/RiderPickupController.php:38
 * @route '/api/rider-app/pickups'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderPickupController::index
 * @see app/Http/Controllers/Api/RiderPickupController.php:38
 * @route '/api/rider-app/pickups'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderPickupController::index
 * @see app/Http/Controllers/Api/RiderPickupController.php:38
 * @route '/api/rider-app/pickups'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderPickupController::index
 * @see app/Http/Controllers/Api/RiderPickupController.php:38
 * @route '/api/rider-app/pickups'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderPickupController::index
 * @see app/Http/Controllers/Api/RiderPickupController.php:38
 * @route '/api/rider-app/pickups'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderPickupController::index
 * @see app/Http/Controllers/Api/RiderPickupController.php:38
 * @route '/api/rider-app/pickups'
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
* @see \App\Http\Controllers\Api\RiderPickupController::show
 * @see app/Http/Controllers/Api/RiderPickupController.php:87
 * @route '/api/rider-app/pickups/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/pickups/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderPickupController::show
 * @see app/Http/Controllers/Api/RiderPickupController.php:87
 * @route '/api/rider-app/pickups/{id}'
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
* @see \App\Http\Controllers\Api\RiderPickupController::show
 * @see app/Http/Controllers/Api/RiderPickupController.php:87
 * @route '/api/rider-app/pickups/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderPickupController::show
 * @see app/Http/Controllers/Api/RiderPickupController.php:87
 * @route '/api/rider-app/pickups/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderPickupController::show
 * @see app/Http/Controllers/Api/RiderPickupController.php:87
 * @route '/api/rider-app/pickups/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderPickupController::show
 * @see app/Http/Controllers/Api/RiderPickupController.php:87
 * @route '/api/rider-app/pickups/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderPickupController::show
 * @see app/Http/Controllers/Api/RiderPickupController.php:87
 * @route '/api/rider-app/pickups/{id}'
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
* @see \App\Http\Controllers\Api\RiderPickupController::scan
 * @see app/Http/Controllers/Api/RiderPickupController.php:130
 * @route '/api/rider-app/pickups/{id}/scan'
 */
export const scan = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scan.url(args, options),
    method: 'post',
})

scan.definition = {
    methods: ["post"],
    url: '/api/rider-app/pickups/{id}/scan',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderPickupController::scan
 * @see app/Http/Controllers/Api/RiderPickupController.php:130
 * @route '/api/rider-app/pickups/{id}/scan'
 */
scan.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return scan.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderPickupController::scan
 * @see app/Http/Controllers/Api/RiderPickupController.php:130
 * @route '/api/rider-app/pickups/{id}/scan'
 */
scan.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scan.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderPickupController::scan
 * @see app/Http/Controllers/Api/RiderPickupController.php:130
 * @route '/api/rider-app/pickups/{id}/scan'
 */
    const scanForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: scan.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderPickupController::scan
 * @see app/Http/Controllers/Api/RiderPickupController.php:130
 * @route '/api/rider-app/pickups/{id}/scan'
 */
        scanForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: scan.url(args, options),
            method: 'post',
        })
    
    scan.form = scanForm
/**
* @see \App\Http\Controllers\Api\RiderPickupController::dropAtHub
 * @see app/Http/Controllers/Api/RiderPickupController.php:250
 * @route '/api/rider-app/pickups/{id}/drop-at-hub'
 */
export const dropAtHub = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dropAtHub.url(args, options),
    method: 'post',
})

dropAtHub.definition = {
    methods: ["post"],
    url: '/api/rider-app/pickups/{id}/drop-at-hub',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderPickupController::dropAtHub
 * @see app/Http/Controllers/Api/RiderPickupController.php:250
 * @route '/api/rider-app/pickups/{id}/drop-at-hub'
 */
dropAtHub.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return dropAtHub.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderPickupController::dropAtHub
 * @see app/Http/Controllers/Api/RiderPickupController.php:250
 * @route '/api/rider-app/pickups/{id}/drop-at-hub'
 */
dropAtHub.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dropAtHub.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderPickupController::dropAtHub
 * @see app/Http/Controllers/Api/RiderPickupController.php:250
 * @route '/api/rider-app/pickups/{id}/drop-at-hub'
 */
    const dropAtHubForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: dropAtHub.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderPickupController::dropAtHub
 * @see app/Http/Controllers/Api/RiderPickupController.php:250
 * @route '/api/rider-app/pickups/{id}/drop-at-hub'
 */
        dropAtHubForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: dropAtHub.url(args, options),
            method: 'post',
        })
    
    dropAtHub.form = dropAtHubForm
/**
* @see \App\Http\Controllers\Api\RiderPickupController::history
 * @see app/Http/Controllers/Api/RiderPickupController.php:340
 * @route '/api/rider-app/history'
 */
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderPickupController::history
 * @see app/Http/Controllers/Api/RiderPickupController.php:340
 * @route '/api/rider-app/history'
 */
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderPickupController::history
 * @see app/Http/Controllers/Api/RiderPickupController.php:340
 * @route '/api/rider-app/history'
 */
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderPickupController::history
 * @see app/Http/Controllers/Api/RiderPickupController.php:340
 * @route '/api/rider-app/history'
 */
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderPickupController::history
 * @see app/Http/Controllers/Api/RiderPickupController.php:340
 * @route '/api/rider-app/history'
 */
    const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderPickupController::history
 * @see app/Http/Controllers/Api/RiderPickupController.php:340
 * @route '/api/rider-app/history'
 */
        historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderPickupController::history
 * @see app/Http/Controllers/Api/RiderPickupController.php:340
 * @route '/api/rider-app/history'
 */
        historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    history.form = historyForm
const RiderPickupController = { index, show, scan, dropAtHub, history }

export default RiderPickupController