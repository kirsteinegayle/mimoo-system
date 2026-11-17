import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/api/courier-app/transfers-data'
 */
const dataf77ee94df4003edb96ef18a79750d0ea = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataf77ee94df4003edb96ef18a79750d0ea.url(options),
    method: 'get',
})

dataf77ee94df4003edb96ef18a79750d0ea.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/transfers-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/api/courier-app/transfers-data'
 */
dataf77ee94df4003edb96ef18a79750d0ea.url = (options?: RouteQueryOptions) => {
    return dataf77ee94df4003edb96ef18a79750d0ea.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/api/courier-app/transfers-data'
 */
dataf77ee94df4003edb96ef18a79750d0ea.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataf77ee94df4003edb96ef18a79750d0ea.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/api/courier-app/transfers-data'
 */
dataf77ee94df4003edb96ef18a79750d0ea.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dataf77ee94df4003edb96ef18a79750d0ea.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/api/courier-app/transfers-data'
 */
    const dataf77ee94df4003edb96ef18a79750d0eaForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dataf77ee94df4003edb96ef18a79750d0ea.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/api/courier-app/transfers-data'
 */
        dataf77ee94df4003edb96ef18a79750d0eaForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dataf77ee94df4003edb96ef18a79750d0ea.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/api/courier-app/transfers-data'
 */
        dataf77ee94df4003edb96ef18a79750d0eaForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dataf77ee94df4003edb96ef18a79750d0ea.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dataf77ee94df4003edb96ef18a79750d0ea.form = dataf77ee94df4003edb96ef18a79750d0eaForm
    /**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/courier/transfers-data'
 */
const dataee28910b32c294c99db63444504a393b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataee28910b32c294c99db63444504a393b.url(options),
    method: 'get',
})

dataee28910b32c294c99db63444504a393b.definition = {
    methods: ["get","head"],
    url: '/courier/transfers-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/courier/transfers-data'
 */
dataee28910b32c294c99db63444504a393b.url = (options?: RouteQueryOptions) => {
    return dataee28910b32c294c99db63444504a393b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/courier/transfers-data'
 */
dataee28910b32c294c99db63444504a393b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataee28910b32c294c99db63444504a393b.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/courier/transfers-data'
 */
dataee28910b32c294c99db63444504a393b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dataee28910b32c294c99db63444504a393b.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/courier/transfers-data'
 */
    const dataee28910b32c294c99db63444504a393bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dataee28910b32c294c99db63444504a393b.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/courier/transfers-data'
 */
        dataee28910b32c294c99db63444504a393bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dataee28910b32c294c99db63444504a393b.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\TransferController::data
 * @see app/Http/Controllers/Courier/TransferController.php:32
 * @route '/courier/transfers-data'
 */
        dataee28910b32c294c99db63444504a393bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dataee28910b32c294c99db63444504a393b.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dataee28910b32c294c99db63444504a393b.form = dataee28910b32c294c99db63444504a393bForm

/**
* Multiple routes resolve to \App\Http\Controllers\Courier\TransferController::data, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `data['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const data = {
    '/api/courier-app/transfers-data': dataf77ee94df4003edb96ef18a79750d0ea,
    '/courier/transfers-data': dataee28910b32c294c99db63444504a393b,
}

/**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/api/courier-app/transfers'
 */
const transfere34ab25152d3ee5f7cc7923d34f6f37b = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfere34ab25152d3ee5f7cc7923d34f6f37b.url(options),
    method: 'post',
})

transfere34ab25152d3ee5f7cc7923d34f6f37b.definition = {
    methods: ["post"],
    url: '/api/courier-app/transfers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/api/courier-app/transfers'
 */
transfere34ab25152d3ee5f7cc7923d34f6f37b.url = (options?: RouteQueryOptions) => {
    return transfere34ab25152d3ee5f7cc7923d34f6f37b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/api/courier-app/transfers'
 */
transfere34ab25152d3ee5f7cc7923d34f6f37b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfere34ab25152d3ee5f7cc7923d34f6f37b.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/api/courier-app/transfers'
 */
    const transfere34ab25152d3ee5f7cc7923d34f6f37bForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transfere34ab25152d3ee5f7cc7923d34f6f37b.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/api/courier-app/transfers'
 */
        transfere34ab25152d3ee5f7cc7923d34f6f37bForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: transfere34ab25152d3ee5f7cc7923d34f6f37b.url(options),
            method: 'post',
        })
    
    transfere34ab25152d3ee5f7cc7923d34f6f37b.form = transfere34ab25152d3ee5f7cc7923d34f6f37bForm
    /**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/courier/transfers'
 */
const transferc969d24b29e81e808b9fb66aa6491827 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transferc969d24b29e81e808b9fb66aa6491827.url(options),
    method: 'post',
})

transferc969d24b29e81e808b9fb66aa6491827.definition = {
    methods: ["post"],
    url: '/courier/transfers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/courier/transfers'
 */
transferc969d24b29e81e808b9fb66aa6491827.url = (options?: RouteQueryOptions) => {
    return transferc969d24b29e81e808b9fb66aa6491827.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/courier/transfers'
 */
transferc969d24b29e81e808b9fb66aa6491827.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transferc969d24b29e81e808b9fb66aa6491827.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/courier/transfers'
 */
    const transferc969d24b29e81e808b9fb66aa6491827Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transferc969d24b29e81e808b9fb66aa6491827.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\TransferController::transfer
 * @see app/Http/Controllers/Courier/TransferController.php:54
 * @route '/courier/transfers'
 */
        transferc969d24b29e81e808b9fb66aa6491827Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: transferc969d24b29e81e808b9fb66aa6491827.url(options),
            method: 'post',
        })
    
    transferc969d24b29e81e808b9fb66aa6491827.form = transferc969d24b29e81e808b9fb66aa6491827Form

/**
* Multiple routes resolve to \App\Http\Controllers\Courier\TransferController::transfer, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `transfer['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const transfer = {
    '/api/courier-app/transfers': transfere34ab25152d3ee5f7cc7923d34f6f37b,
    '/courier/transfers': transferc969d24b29e81e808b9fb66aa6491827,
}

const TransferController = { data, transfer }

export default TransferController