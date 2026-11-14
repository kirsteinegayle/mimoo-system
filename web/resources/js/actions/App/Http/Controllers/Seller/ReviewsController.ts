import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Seller\ReviewsController::feed
 * @see app/Http/Controllers/Seller/ReviewsController.php:41
 * @route '/seller/reviews/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/seller/reviews/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Seller\ReviewsController::feed
 * @see app/Http/Controllers/Seller/ReviewsController.php:41
 * @route '/seller/reviews/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Seller\ReviewsController::feed
 * @see app/Http/Controllers/Seller/ReviewsController.php:41
 * @route '/seller/reviews/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Seller\ReviewsController::feed
 * @see app/Http/Controllers/Seller/ReviewsController.php:41
 * @route '/seller/reviews/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Seller\ReviewsController::feed
 * @see app/Http/Controllers/Seller/ReviewsController.php:41
 * @route '/seller/reviews/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Seller\ReviewsController::feed
 * @see app/Http/Controllers/Seller/ReviewsController.php:41
 * @route '/seller/reviews/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Seller\ReviewsController::feed
 * @see app/Http/Controllers/Seller/ReviewsController.php:41
 * @route '/seller/reviews/feed'
 */
        feedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    feed.form = feedForm
/**
* @see \App\Http\Controllers\Seller\ReviewsController::reply
 * @see app/Http/Controllers/Seller/ReviewsController.php:64
 * @route '/seller/reviews/{id}/reply'
 */
export const reply = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply.url(args, options),
    method: 'post',
})

reply.definition = {
    methods: ["post"],
    url: '/seller/reviews/{id}/reply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Seller\ReviewsController::reply
 * @see app/Http/Controllers/Seller/ReviewsController.php:64
 * @route '/seller/reviews/{id}/reply'
 */
reply.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reply.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Seller\ReviewsController::reply
 * @see app/Http/Controllers/Seller/ReviewsController.php:64
 * @route '/seller/reviews/{id}/reply'
 */
reply.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Seller\ReviewsController::reply
 * @see app/Http/Controllers/Seller/ReviewsController.php:64
 * @route '/seller/reviews/{id}/reply'
 */
    const replyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reply.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Seller\ReviewsController::reply
 * @see app/Http/Controllers/Seller/ReviewsController.php:64
 * @route '/seller/reviews/{id}/reply'
 */
        replyForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reply.url(args, options),
            method: 'post',
        })
    
    reply.form = replyForm
const ReviewsController = { feed, reply }

export default ReviewsController