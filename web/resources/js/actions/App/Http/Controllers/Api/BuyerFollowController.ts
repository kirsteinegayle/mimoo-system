import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
const follow88db0e8635d1b62a321f91a0a48c2313 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: follow88db0e8635d1b62a321f91a0a48c2313.url(args, options),
    method: 'post',
})

follow88db0e8635d1b62a321f91a0a48c2313.definition = {
    methods: ["post"],
    url: '/api/buyer/sellers/{id}/follow',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
follow88db0e8635d1b62a321f91a0a48c2313.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return follow88db0e8635d1b62a321f91a0a48c2313.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
follow88db0e8635d1b62a321f91a0a48c2313.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: follow88db0e8635d1b62a321f91a0a48c2313.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
    const follow88db0e8635d1b62a321f91a0a48c2313Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: follow88db0e8635d1b62a321f91a0a48c2313.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
        follow88db0e8635d1b62a321f91a0a48c2313Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: follow88db0e8635d1b62a321f91a0a48c2313.url(args, options),
            method: 'post',
        })
    
    follow88db0e8635d1b62a321f91a0a48c2313.form = follow88db0e8635d1b62a321f91a0a48c2313Form
    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/buyer/sellers/{id}/follow'
 */
const follow45a749bcb6f0dce962543390539b13bd = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: follow45a749bcb6f0dce962543390539b13bd.url(args, options),
    method: 'post',
})

follow45a749bcb6f0dce962543390539b13bd.definition = {
    methods: ["post"],
    url: '/buyer/sellers/{id}/follow',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/buyer/sellers/{id}/follow'
 */
follow45a749bcb6f0dce962543390539b13bd.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return follow45a749bcb6f0dce962543390539b13bd.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/buyer/sellers/{id}/follow'
 */
follow45a749bcb6f0dce962543390539b13bd.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: follow45a749bcb6f0dce962543390539b13bd.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/buyer/sellers/{id}/follow'
 */
    const follow45a749bcb6f0dce962543390539b13bdForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: follow45a749bcb6f0dce962543390539b13bd.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/buyer/sellers/{id}/follow'
 */
        follow45a749bcb6f0dce962543390539b13bdForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: follow45a749bcb6f0dce962543390539b13bd.url(args, options),
            method: 'post',
        })
    
    follow45a749bcb6f0dce962543390539b13bd.form = follow45a749bcb6f0dce962543390539b13bdForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerFollowController::follow, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `follow['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const follow = {
    '/api/buyer/sellers/{id}/follow': follow88db0e8635d1b62a321f91a0a48c2313,
    '/buyer/sellers/{id}/follow': follow45a749bcb6f0dce962543390539b13bd,
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
const unfollow88db0e8635d1b62a321f91a0a48c2313 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfollow88db0e8635d1b62a321f91a0a48c2313.url(args, options),
    method: 'delete',
})

unfollow88db0e8635d1b62a321f91a0a48c2313.definition = {
    methods: ["delete"],
    url: '/api/buyer/sellers/{id}/follow',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
unfollow88db0e8635d1b62a321f91a0a48c2313.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unfollow88db0e8635d1b62a321f91a0a48c2313.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
unfollow88db0e8635d1b62a321f91a0a48c2313.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfollow88db0e8635d1b62a321f91a0a48c2313.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
    const unfollow88db0e8635d1b62a321f91a0a48c2313Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unfollow88db0e8635d1b62a321f91a0a48c2313.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
        unfollow88db0e8635d1b62a321f91a0a48c2313Form.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unfollow88db0e8635d1b62a321f91a0a48c2313.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unfollow88db0e8635d1b62a321f91a0a48c2313.form = unfollow88db0e8635d1b62a321f91a0a48c2313Form
    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/buyer/sellers/{id}/follow'
 */
const unfollow45a749bcb6f0dce962543390539b13bd = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfollow45a749bcb6f0dce962543390539b13bd.url(args, options),
    method: 'delete',
})

unfollow45a749bcb6f0dce962543390539b13bd.definition = {
    methods: ["delete"],
    url: '/buyer/sellers/{id}/follow',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/buyer/sellers/{id}/follow'
 */
unfollow45a749bcb6f0dce962543390539b13bd.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unfollow45a749bcb6f0dce962543390539b13bd.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/buyer/sellers/{id}/follow'
 */
unfollow45a749bcb6f0dce962543390539b13bd.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfollow45a749bcb6f0dce962543390539b13bd.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/buyer/sellers/{id}/follow'
 */
    const unfollow45a749bcb6f0dce962543390539b13bdForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unfollow45a749bcb6f0dce962543390539b13bd.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/buyer/sellers/{id}/follow'
 */
        unfollow45a749bcb6f0dce962543390539b13bdForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unfollow45a749bcb6f0dce962543390539b13bd.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unfollow45a749bcb6f0dce962543390539b13bd.form = unfollow45a749bcb6f0dce962543390539b13bdForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerFollowController::unfollow, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `unfollow['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const unfollow = {
    '/api/buyer/sellers/{id}/follow': unfollow88db0e8635d1b62a321f91a0a48c2313,
    '/buyer/sellers/{id}/follow': unfollow45a749bcb6f0dce962543390539b13bd,
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
const index44d8ba810af76733b781aa3b3629a7f2 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index44d8ba810af76733b781aa3b3629a7f2.url(options),
    method: 'get',
})

index44d8ba810af76733b781aa3b3629a7f2.definition = {
    methods: ["get","head"],
    url: '/api/buyer/following',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
index44d8ba810af76733b781aa3b3629a7f2.url = (options?: RouteQueryOptions) => {
    return index44d8ba810af76733b781aa3b3629a7f2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
index44d8ba810af76733b781aa3b3629a7f2.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index44d8ba810af76733b781aa3b3629a7f2.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
index44d8ba810af76733b781aa3b3629a7f2.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index44d8ba810af76733b781aa3b3629a7f2.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
    const index44d8ba810af76733b781aa3b3629a7f2Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index44d8ba810af76733b781aa3b3629a7f2.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
        index44d8ba810af76733b781aa3b3629a7f2Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index44d8ba810af76733b781aa3b3629a7f2.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
        index44d8ba810af76733b781aa3b3629a7f2Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index44d8ba810af76733b781aa3b3629a7f2.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index44d8ba810af76733b781aa3b3629a7f2.form = index44d8ba810af76733b781aa3b3629a7f2Form
    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/buyer/following'
 */
const index0d0ce1ed527088728d7bfebdd0a84503 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index0d0ce1ed527088728d7bfebdd0a84503.url(options),
    method: 'get',
})

index0d0ce1ed527088728d7bfebdd0a84503.definition = {
    methods: ["get","head"],
    url: '/buyer/following',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/buyer/following'
 */
index0d0ce1ed527088728d7bfebdd0a84503.url = (options?: RouteQueryOptions) => {
    return index0d0ce1ed527088728d7bfebdd0a84503.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/buyer/following'
 */
index0d0ce1ed527088728d7bfebdd0a84503.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index0d0ce1ed527088728d7bfebdd0a84503.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/buyer/following'
 */
index0d0ce1ed527088728d7bfebdd0a84503.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index0d0ce1ed527088728d7bfebdd0a84503.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/buyer/following'
 */
    const index0d0ce1ed527088728d7bfebdd0a84503Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index0d0ce1ed527088728d7bfebdd0a84503.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/buyer/following'
 */
        index0d0ce1ed527088728d7bfebdd0a84503Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index0d0ce1ed527088728d7bfebdd0a84503.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/buyer/following'
 */
        index0d0ce1ed527088728d7bfebdd0a84503Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index0d0ce1ed527088728d7bfebdd0a84503.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index0d0ce1ed527088728d7bfebdd0a84503.form = index0d0ce1ed527088728d7bfebdd0a84503Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerFollowController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/following': index44d8ba810af76733b781aa3b3629a7f2,
    '/buyer/following': index0d0ce1ed527088728d7bfebdd0a84503,
}

const BuyerFollowController = { follow, unfollow, index }

export default BuyerFollowController