import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::index
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:25
 * @route '/api/courier-app/branch-assign'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/branch-assign',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::index
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:25
 * @route '/api/courier-app/branch-assign'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::index
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:25
 * @route '/api/courier-app/branch-assign'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::index
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:25
 * @route '/api/courier-app/branch-assign'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::index
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:25
 * @route '/api/courier-app/branch-assign'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::index
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:25
 * @route '/api/courier-app/branch-assign'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::index
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:25
 * @route '/api/courier-app/branch-assign'
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
* @see \App\Http\Controllers\Api\CourierBranchAssignController::show
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:30
 * @route '/api/courier-app/branch-assign/{branch}'
 */
export const show = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/branch-assign/{branch}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::show
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:30
 * @route '/api/courier-app/branch-assign/{branch}'
 */
show.url = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: args.branch,
                }

    return show.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::show
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:30
 * @route '/api/courier-app/branch-assign/{branch}'
 */
show.get = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::show
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:30
 * @route '/api/courier-app/branch-assign/{branch}'
 */
show.head = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::show
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:30
 * @route '/api/courier-app/branch-assign/{branch}'
 */
    const showForm = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::show
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:30
 * @route '/api/courier-app/branch-assign/{branch}'
 */
        showForm.get = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::show
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:30
 * @route '/api/courier-app/branch-assign/{branch}'
 */
        showForm.head = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignPickup
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:40
 * @route '/api/courier-app/branch-assign/{branch}/pickups/{id}'
 */
export const assignPickup = (args: { branch: string | number, id: string | number } | [branch: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignPickup.url(args, options),
    method: 'post',
})

assignPickup.definition = {
    methods: ["post"],
    url: '/api/courier-app/branch-assign/{branch}/pickups/{id}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignPickup
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:40
 * @route '/api/courier-app/branch-assign/{branch}/pickups/{id}'
 */
assignPickup.url = (args: { branch: string | number, id: string | number } | [branch: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                    id: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: args.branch,
                                id: args.id,
                }

    return assignPickup.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignPickup
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:40
 * @route '/api/courier-app/branch-assign/{branch}/pickups/{id}'
 */
assignPickup.post = (args: { branch: string | number, id: string | number } | [branch: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignPickup.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignPickup
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:40
 * @route '/api/courier-app/branch-assign/{branch}/pickups/{id}'
 */
    const assignPickupForm = (args: { branch: string | number, id: string | number } | [branch: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignPickup.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignPickup
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:40
 * @route '/api/courier-app/branch-assign/{branch}/pickups/{id}'
 */
        assignPickupForm.post = (args: { branch: string | number, id: string | number } | [branch: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignPickup.url(args, options),
            method: 'post',
        })
    
    assignPickup.form = assignPickupForm
/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignDelivery
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:57
 * @route '/api/courier-app/branch-assign/{branch}/deliveries/{orderId}'
 */
export const assignDelivery = (args: { branch: string | number, orderId: string | number } | [branch: string | number, orderId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignDelivery.url(args, options),
    method: 'post',
})

assignDelivery.definition = {
    methods: ["post"],
    url: '/api/courier-app/branch-assign/{branch}/deliveries/{orderId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignDelivery
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:57
 * @route '/api/courier-app/branch-assign/{branch}/deliveries/{orderId}'
 */
assignDelivery.url = (args: { branch: string | number, orderId: string | number } | [branch: string | number, orderId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                    orderId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: args.branch,
                                orderId: args.orderId,
                }

    return assignDelivery.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace('{orderId}', parsedArgs.orderId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignDelivery
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:57
 * @route '/api/courier-app/branch-assign/{branch}/deliveries/{orderId}'
 */
assignDelivery.post = (args: { branch: string | number, orderId: string | number } | [branch: string | number, orderId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignDelivery.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignDelivery
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:57
 * @route '/api/courier-app/branch-assign/{branch}/deliveries/{orderId}'
 */
    const assignDeliveryForm = (args: { branch: string | number, orderId: string | number } | [branch: string | number, orderId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignDelivery.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierBranchAssignController::assignDelivery
 * @see app/Http/Controllers/Api/CourierBranchAssignController.php:57
 * @route '/api/courier-app/branch-assign/{branch}/deliveries/{orderId}'
 */
        assignDeliveryForm.post = (args: { branch: string | number, orderId: string | number } | [branch: string | number, orderId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignDelivery.url(args, options),
            method: 'post',
        })
    
    assignDelivery.form = assignDeliveryForm
const CourierBranchAssignController = { index, show, assignPickup, assignDelivery }

export default CourierBranchAssignController