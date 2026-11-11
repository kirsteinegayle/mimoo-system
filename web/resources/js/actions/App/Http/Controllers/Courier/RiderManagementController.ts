import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\RiderManagementController::index
 * @see app/Http/Controllers/Courier/RiderManagementController.php:19
 * @route '/courier/rider-management'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/courier/rider-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\RiderManagementController::index
 * @see app/Http/Controllers/Courier/RiderManagementController.php:19
 * @route '/courier/rider-management'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\RiderManagementController::index
 * @see app/Http/Controllers/Courier/RiderManagementController.php:19
 * @route '/courier/rider-management'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\RiderManagementController::index
 * @see app/Http/Controllers/Courier/RiderManagementController.php:19
 * @route '/courier/rider-management'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\RiderManagementController::index
 * @see app/Http/Controllers/Courier/RiderManagementController.php:19
 * @route '/courier/rider-management'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\RiderManagementController::index
 * @see app/Http/Controllers/Courier/RiderManagementController.php:19
 * @route '/courier/rider-management'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\RiderManagementController::index
 * @see app/Http/Controllers/Courier/RiderManagementController.php:19
 * @route '/courier/rider-management'
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
* @see \App\Http\Controllers\Courier\RiderManagementController::approve
 * @see app/Http/Controllers/Courier/RiderManagementController.php:131
 * @route '/api/courier/riders/{id}/approve'
 */
export const approve = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/api/courier/riders/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\RiderManagementController::approve
 * @see app/Http/Controllers/Courier/RiderManagementController.php:131
 * @route '/api/courier/riders/{id}/approve'
 */
approve.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\RiderManagementController::approve
 * @see app/Http/Controllers/Courier/RiderManagementController.php:131
 * @route '/api/courier/riders/{id}/approve'
 */
approve.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\RiderManagementController::approve
 * @see app/Http/Controllers/Courier/RiderManagementController.php:131
 * @route '/api/courier/riders/{id}/approve'
 */
    const approveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\RiderManagementController::approve
 * @see app/Http/Controllers/Courier/RiderManagementController.php:131
 * @route '/api/courier/riders/{id}/approve'
 */
        approveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Courier\RiderManagementController::reject
 * @see app/Http/Controllers/Courier/RiderManagementController.php:308
 * @route '/api/courier/riders/{id}/reject'
 */
export const reject = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/api/courier/riders/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\RiderManagementController::reject
 * @see app/Http/Controllers/Courier/RiderManagementController.php:308
 * @route '/api/courier/riders/{id}/reject'
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
* @see \App\Http\Controllers\Courier\RiderManagementController::reject
 * @see app/Http/Controllers/Courier/RiderManagementController.php:308
 * @route '/api/courier/riders/{id}/reject'
 */
reject.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\RiderManagementController::reject
 * @see app/Http/Controllers/Courier/RiderManagementController.php:308
 * @route '/api/courier/riders/{id}/reject'
 */
    const rejectForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\RiderManagementController::reject
 * @see app/Http/Controllers/Courier/RiderManagementController.php:308
 * @route '/api/courier/riders/{id}/reject'
 */
        rejectForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
const RiderManagementController = { index, approve, reject }

export default RiderManagementController