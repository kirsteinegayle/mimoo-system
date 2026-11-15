import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::mine
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:28
 * @route '/api/buyer/reviews/mine'
 */
export const mine = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mine.url(options),
    method: 'get',
})

mine.definition = {
    methods: ["get","head"],
    url: '/api/buyer/reviews/mine',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::mine
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:28
 * @route '/api/buyer/reviews/mine'
 */
mine.url = (options?: RouteQueryOptions) => {
    return mine.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::mine
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:28
 * @route '/api/buyer/reviews/mine'
 */
mine.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mine.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::mine
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:28
 * @route '/api/buyer/reviews/mine'
 */
mine.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mine.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::mine
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:28
 * @route '/api/buyer/reviews/mine'
 */
    const mineForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: mine.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::mine
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:28
 * @route '/api/buyer/reviews/mine'
 */
        mineForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: mine.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::mine
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:28
 * @route '/api/buyer/reviews/mine'
 */
        mineForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: mine.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    mine.form = mineForm
/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::index
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/my-reviews',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::index
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::index
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\MyReviewsController::index
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::index
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::index
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\MyReviewsController::index
 * @see app/Http/Controllers/Buyer/MyReviewsController.php:19
 * @route '/my-reviews'
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
const MyReviewsController = { mine, index }

export default MyReviewsController