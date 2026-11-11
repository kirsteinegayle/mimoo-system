import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RiderShiftController::checkIn
 * @see app/Http/Controllers/Api/RiderShiftController.php:29
 * @route '/api/rider-app/check-in'
 */
export const checkIn = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn.url(options),
    method: 'post',
})

checkIn.definition = {
    methods: ["post"],
    url: '/api/rider-app/check-in',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderShiftController::checkIn
 * @see app/Http/Controllers/Api/RiderShiftController.php:29
 * @route '/api/rider-app/check-in'
 */
checkIn.url = (options?: RouteQueryOptions) => {
    return checkIn.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderShiftController::checkIn
 * @see app/Http/Controllers/Api/RiderShiftController.php:29
 * @route '/api/rider-app/check-in'
 */
checkIn.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderShiftController::checkIn
 * @see app/Http/Controllers/Api/RiderShiftController.php:29
 * @route '/api/rider-app/check-in'
 */
    const checkInForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: checkIn.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderShiftController::checkIn
 * @see app/Http/Controllers/Api/RiderShiftController.php:29
 * @route '/api/rider-app/check-in'
 */
        checkInForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: checkIn.url(options),
            method: 'post',
        })
    
    checkIn.form = checkInForm
/**
* @see \App\Http\Controllers\Api\RiderShiftController::checkOut
 * @see app/Http/Controllers/Api/RiderShiftController.php:34
 * @route '/api/rider-app/check-out'
 */
export const checkOut = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOut.url(options),
    method: 'post',
})

checkOut.definition = {
    methods: ["post"],
    url: '/api/rider-app/check-out',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderShiftController::checkOut
 * @see app/Http/Controllers/Api/RiderShiftController.php:34
 * @route '/api/rider-app/check-out'
 */
checkOut.url = (options?: RouteQueryOptions) => {
    return checkOut.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderShiftController::checkOut
 * @see app/Http/Controllers/Api/RiderShiftController.php:34
 * @route '/api/rider-app/check-out'
 */
checkOut.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOut.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderShiftController::checkOut
 * @see app/Http/Controllers/Api/RiderShiftController.php:34
 * @route '/api/rider-app/check-out'
 */
    const checkOutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: checkOut.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderShiftController::checkOut
 * @see app/Http/Controllers/Api/RiderShiftController.php:34
 * @route '/api/rider-app/check-out'
 */
        checkOutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: checkOut.url(options),
            method: 'post',
        })
    
    checkOut.form = checkOutForm
const RiderShiftController = { checkIn, checkOut }

export default RiderShiftController