import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
export const follow = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: follow.url(args, options),
    method: 'post',
})

follow.definition = {
    methods: ["post"],
    url: '/api/buyer/sellers/{id}/follow',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
follow.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return follow.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
follow.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: follow.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
    const followForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: follow.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::follow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:42
 * @route '/api/buyer/sellers/{id}/follow'
 */
        followForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: follow.url(args, options),
            method: 'post',
        })
    
    follow.form = followForm
/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
export const unfollow = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfollow.url(args, options),
    method: 'delete',
})

unfollow.definition = {
    methods: ["delete"],
    url: '/api/buyer/sellers/{id}/follow',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
unfollow.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unfollow.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
unfollow.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfollow.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::unfollow
 * @see app/Http/Controllers/Api/BuyerFollowController.php:58
 * @route '/api/buyer/sellers/{id}/follow'
 */
    const unfollowForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unfollow.url(args, {
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
        unfollowForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unfollow.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unfollow.form = unfollowForm
/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/following',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerFollowController::index
 * @see app/Http/Controllers/Api/BuyerFollowController.php:74
 * @route '/api/buyer/following'
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
const BuyerFollowController = { follow, unfollow, index }

export default BuyerFollowController