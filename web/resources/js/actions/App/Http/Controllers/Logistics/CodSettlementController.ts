import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::data
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:55
 * @route '/logistics/cod-data'
 */
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/logistics/cod-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::data
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:55
 * @route '/logistics/cod-data'
 */
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::data
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:55
 * @route '/logistics/cod-data'
 */
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::data
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:55
 * @route '/logistics/cod-data'
 */
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Logistics\CodSettlementController::data
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:55
 * @route '/logistics/cod-data'
 */
    const dataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: data.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Logistics\CodSettlementController::data
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:55
 * @route '/logistics/cod-data'
 */
        dataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Logistics\CodSettlementController::data
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:55
 * @route '/logistics/cod-data'
 */
        dataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    data.form = dataForm
/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::received
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:107
 * @route '/logistics/cod/{id}/received'
 */
export const received = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: received.url(args, options),
    method: 'post',
})

received.definition = {
    methods: ["post"],
    url: '/logistics/cod/{id}/received',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::received
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:107
 * @route '/logistics/cod/{id}/received'
 */
received.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return received.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::received
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:107
 * @route '/logistics/cod/{id}/received'
 */
received.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: received.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Logistics\CodSettlementController::received
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:107
 * @route '/logistics/cod/{id}/received'
 */
    const receivedForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: received.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\CodSettlementController::received
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:107
 * @route '/logistics/cod/{id}/received'
 */
        receivedForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: received.url(args, options),
            method: 'post',
        })
    
    received.form = receivedForm
/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::settled
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:112
 * @route '/logistics/cod/{id}/settled'
 */
export const settled = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: settled.url(args, options),
    method: 'post',
})

settled.definition = {
    methods: ["post"],
    url: '/logistics/cod/{id}/settled',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::settled
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:112
 * @route '/logistics/cod/{id}/settled'
 */
settled.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return settled.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\CodSettlementController::settled
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:112
 * @route '/logistics/cod/{id}/settled'
 */
settled.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: settled.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Logistics\CodSettlementController::settled
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:112
 * @route '/logistics/cod/{id}/settled'
 */
    const settledForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: settled.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\CodSettlementController::settled
 * @see app/Http/Controllers/Logistics/CodSettlementController.php:112
 * @route '/logistics/cod/{id}/settled'
 */
        settledForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: settled.url(args, options),
            method: 'post',
        })
    
    settled.form = settledForm
const CodSettlementController = { data, received, settled }

export default CodSettlementController