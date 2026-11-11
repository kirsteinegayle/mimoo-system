import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Buyer\NotificationController::notifications
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
export const notifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})

notifications.definition = {
    methods: ["get","head"],
    url: '/buyer/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\NotificationController::notifications
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
notifications.url = (options?: RouteQueryOptions) => {
    return notifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\NotificationController::notifications
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
notifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\NotificationController::notifications
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
notifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notifications.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\NotificationController::notifications
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
    const notificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notifications.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\NotificationController::notifications
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
        notificationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\NotificationController::notifications
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
        notificationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notifications.form = notificationsForm
/**
 * @see routes/web.php:1895
 * @route '/returns'
 */
export const returns = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: returns.url(options),
    method: 'get',
})

returns.definition = {
    methods: ["get","head"],
    url: '/returns',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1895
 * @route '/returns'
 */
returns.url = (options?: RouteQueryOptions) => {
    return returns.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1895
 * @route '/returns'
 */
returns.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: returns.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1895
 * @route '/returns'
 */
returns.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: returns.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1895
 * @route '/returns'
 */
    const returnsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: returns.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1895
 * @route '/returns'
 */
        returnsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: returns.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1895
 * @route '/returns'
 */
        returnsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: returns.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    returns.form = returnsForm
/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::reviews
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
export const reviews = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reviews.url(options),
    method: 'get',
})

reviews.definition = {
    methods: ["get","head"],
    url: '/my-reviews',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::reviews
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
reviews.url = (options?: RouteQueryOptions) => {
    return reviews.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::reviews
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
reviews.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reviews.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::reviews
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
reviews.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reviews.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::reviews
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
    const reviewsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reviews.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::reviews
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
        reviewsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reviews.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::reviews
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
        reviewsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reviews.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    reviews.form = reviewsForm
const buyer = {
    notifications: Object.assign(notifications, notifications),
returns: Object.assign(returns, returns),
reviews: Object.assign(reviews, reviews),
}

export default buyer