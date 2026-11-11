import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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
const deliveryManagement = {
    assign: Object.assign(assign, assign),
}

export default deliveryManagement