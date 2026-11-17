import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OrderController::quote
 * @see app/Http/Controllers/OrderController.php:149
 * @route '/api/shipping/quote'
 */
export const quote = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: quote.url(options),
    method: 'get',
})

quote.definition = {
    methods: ["get","head"],
    url: '/api/shipping/quote',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OrderController::quote
 * @see app/Http/Controllers/OrderController.php:149
 * @route '/api/shipping/quote'
 */
quote.url = (options?: RouteQueryOptions) => {
    return quote.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OrderController::quote
 * @see app/Http/Controllers/OrderController.php:149
 * @route '/api/shipping/quote'
 */
quote.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: quote.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OrderController::quote
 * @see app/Http/Controllers/OrderController.php:149
 * @route '/api/shipping/quote'
 */
quote.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: quote.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OrderController::quote
 * @see app/Http/Controllers/OrderController.php:149
 * @route '/api/shipping/quote'
 */
    const quoteForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: quote.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OrderController::quote
 * @see app/Http/Controllers/OrderController.php:149
 * @route '/api/shipping/quote'
 */
        quoteForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: quote.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OrderController::quote
 * @see app/Http/Controllers/OrderController.php:149
 * @route '/api/shipping/quote'
 */
        quoteForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: quote.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    quote.form = quoteForm
const shipping = {
    quote: Object.assign(quote, quote),
}

export default shipping