import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::riders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:38
 * @route '/api/courier-app/delivery-riders'
 */
export const riders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})

riders.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/delivery-riders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::riders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:38
 * @route '/api/courier-app/delivery-riders'
 */
riders.url = (options?: RouteQueryOptions) => {
    return riders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::riders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:38
 * @route '/api/courier-app/delivery-riders'
 */
riders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::riders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:38
 * @route '/api/courier-app/delivery-riders'
 */
riders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: riders.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::riders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:38
 * @route '/api/courier-app/delivery-riders'
 */
    const ridersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: riders.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::riders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:38
 * @route '/api/courier-app/delivery-riders'
 */
        ridersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riders.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::riders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:38
 * @route '/api/courier-app/delivery-riders'
 */
        ridersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riders.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    riders.form = ridersForm
/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::assign
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:148
 * @route '/api/courier-app/delivery-jobs'
 */
export const assign = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(options),
    method: 'post',
})

assign.definition = {
    methods: ["post"],
    url: '/api/courier-app/delivery-jobs',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::assign
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:148
 * @route '/api/courier-app/delivery-jobs'
 */
assign.url = (options?: RouteQueryOptions) => {
    return assign.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::assign
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:148
 * @route '/api/courier-app/delivery-jobs'
 */
assign.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::assign
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:148
 * @route '/api/courier-app/delivery-jobs'
 */
    const assignForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assign.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::assign
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:148
 * @route '/api/courier-app/delivery-jobs'
 */
        assignForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assign.url(options),
            method: 'post',
        })
    
    assign.form = assignForm
/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::orders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:86
 * @route '/api/courier-app/delivery-orders'
 */
export const orders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})

orders.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/delivery-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::orders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:86
 * @route '/api/courier-app/delivery-orders'
 */
orders.url = (options?: RouteQueryOptions) => {
    return orders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::orders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:86
 * @route '/api/courier-app/delivery-orders'
 */
orders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierDeliveryController::orders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:86
 * @route '/api/courier-app/delivery-orders'
 */
orders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: orders.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::orders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:86
 * @route '/api/courier-app/delivery-orders'
 */
    const ordersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: orders.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::orders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:86
 * @route '/api/courier-app/delivery-orders'
 */
        ordersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierDeliveryController::orders
 * @see app/Http/Controllers/Api/CourierDeliveryController.php:86
 * @route '/api/courier-app/delivery-orders'
 */
        ordersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    orders.form = ordersForm
const CourierDeliveryController = { riders, assign, orders }

export default CourierDeliveryController