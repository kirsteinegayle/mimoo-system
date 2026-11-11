import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::index
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:27
 * @route '/courier/delivery-management'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/courier/delivery-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::index
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:27
 * @route '/courier/delivery-management'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::index
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:27
 * @route '/courier/delivery-management'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::index
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:27
 * @route '/courier/delivery-management'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::index
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:27
 * @route '/courier/delivery-management'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::index
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:27
 * @route '/courier/delivery-management'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::index
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:27
 * @route '/courier/delivery-management'
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
/**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::assign
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:88
 * @route '/courier/delivery-management/assign'
 */
export const assign = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(options),
    method: 'post',
})

assign.definition = {
    methods: ["post"],
    url: '/courier/delivery-management/assign',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::assign
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:88
 * @route '/courier/delivery-management/assign'
 */
assign.url = (options?: RouteQueryOptions) => {
    return assign.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::assign
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:88
 * @route '/courier/delivery-management/assign'
 */
assign.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::assign
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:88
 * @route '/courier/delivery-management/assign'
 */
    const assignForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assign.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\DeliveryManagementController::assign
 * @see app/Http/Controllers/Courier/DeliveryManagementController.php:88
 * @route '/courier/delivery-management/assign'
 */
        assignForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assign.url(options),
            method: 'post',
        })
    
    assign.form = assignForm
const DeliveryManagementController = { index, assign }

export default DeliveryManagementController