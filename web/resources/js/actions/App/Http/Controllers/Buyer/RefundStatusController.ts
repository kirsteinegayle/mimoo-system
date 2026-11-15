import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/api/buyer/refunds'
 */
const index34488f03cd6741282bedb33676786a6d = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index34488f03cd6741282bedb33676786a6d.url(options),
    method: 'get',
})

index34488f03cd6741282bedb33676786a6d.definition = {
    methods: ["get","head"],
    url: '/api/buyer/refunds',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/api/buyer/refunds'
 */
index34488f03cd6741282bedb33676786a6d.url = (options?: RouteQueryOptions) => {
    return index34488f03cd6741282bedb33676786a6d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/api/buyer/refunds'
 */
index34488f03cd6741282bedb33676786a6d.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index34488f03cd6741282bedb33676786a6d.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/api/buyer/refunds'
 */
index34488f03cd6741282bedb33676786a6d.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index34488f03cd6741282bedb33676786a6d.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/api/buyer/refunds'
 */
    const index34488f03cd6741282bedb33676786a6dForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index34488f03cd6741282bedb33676786a6d.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/api/buyer/refunds'
 */
        index34488f03cd6741282bedb33676786a6dForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index34488f03cd6741282bedb33676786a6d.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/api/buyer/refunds'
 */
        index34488f03cd6741282bedb33676786a6dForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index34488f03cd6741282bedb33676786a6d.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index34488f03cd6741282bedb33676786a6d.form = index34488f03cd6741282bedb33676786a6dForm
    /**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/buyer/refunds'
 */
const index50a9034a08390ef8501439a82905bfb2 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index50a9034a08390ef8501439a82905bfb2.url(options),
    method: 'get',
})

index50a9034a08390ef8501439a82905bfb2.definition = {
    methods: ["get","head"],
    url: '/buyer/refunds',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/buyer/refunds'
 */
index50a9034a08390ef8501439a82905bfb2.url = (options?: RouteQueryOptions) => {
    return index50a9034a08390ef8501439a82905bfb2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/buyer/refunds'
 */
index50a9034a08390ef8501439a82905bfb2.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index50a9034a08390ef8501439a82905bfb2.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/buyer/refunds'
 */
index50a9034a08390ef8501439a82905bfb2.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index50a9034a08390ef8501439a82905bfb2.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/buyer/refunds'
 */
    const index50a9034a08390ef8501439a82905bfb2Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index50a9034a08390ef8501439a82905bfb2.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/buyer/refunds'
 */
        index50a9034a08390ef8501439a82905bfb2Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index50a9034a08390ef8501439a82905bfb2.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\RefundStatusController::index
 * @see app/Http/Controllers/Buyer/RefundStatusController.php:19
 * @route '/buyer/refunds'
 */
        index50a9034a08390ef8501439a82905bfb2Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index50a9034a08390ef8501439a82905bfb2.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index50a9034a08390ef8501439a82905bfb2.form = index50a9034a08390ef8501439a82905bfb2Form

/**
* Multiple routes resolve to \App\Http\Controllers\Buyer\RefundStatusController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/refunds': index34488f03cd6741282bedb33676786a6d,
    '/buyer/refunds': index50a9034a08390ef8501439a82905bfb2,
}

const RefundStatusController = { index }

export default RefundStatusController