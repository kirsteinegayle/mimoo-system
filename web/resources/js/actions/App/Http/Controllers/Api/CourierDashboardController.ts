import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierDashboardController::index
 * @see app/Http/Controllers/Api/CourierDashboardController.php:15
 * @route '/api/courier-app/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierDashboardController::index
 * @see app/Http/Controllers/Api/CourierDashboardController.php:15
 * @route '/api/courier-app/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierDashboardController::index
 * @see app/Http/Controllers/Api/CourierDashboardController.php:15
 * @route '/api/courier-app/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierDashboardController::index
 * @see app/Http/Controllers/Api/CourierDashboardController.php:15
 * @route '/api/courier-app/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierDashboardController::index
 * @see app/Http/Controllers/Api/CourierDashboardController.php:15
 * @route '/api/courier-app/dashboard'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierDashboardController::index
 * @see app/Http/Controllers/Api/CourierDashboardController.php:15
 * @route '/api/courier-app/dashboard'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierDashboardController::index
 * @see app/Http/Controllers/Api/CourierDashboardController.php:15
 * @route '/api/courier-app/dashboard'
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
* @see \App\Http\Controllers\Api\CourierDashboardController::activity
 * @see app/Http/Controllers/Api/CourierDashboardController.php:74
 * @route '/api/courier-app/activity'
 */
export const activity = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(options),
    method: 'get',
})

activity.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierDashboardController::activity
 * @see app/Http/Controllers/Api/CourierDashboardController.php:74
 * @route '/api/courier-app/activity'
 */
activity.url = (options?: RouteQueryOptions) => {
    return activity.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierDashboardController::activity
 * @see app/Http/Controllers/Api/CourierDashboardController.php:74
 * @route '/api/courier-app/activity'
 */
activity.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierDashboardController::activity
 * @see app/Http/Controllers/Api/CourierDashboardController.php:74
 * @route '/api/courier-app/activity'
 */
activity.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activity.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierDashboardController::activity
 * @see app/Http/Controllers/Api/CourierDashboardController.php:74
 * @route '/api/courier-app/activity'
 */
    const activityForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: activity.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierDashboardController::activity
 * @see app/Http/Controllers/Api/CourierDashboardController.php:74
 * @route '/api/courier-app/activity'
 */
        activityForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activity.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierDashboardController::activity
 * @see app/Http/Controllers/Api/CourierDashboardController.php:74
 * @route '/api/courier-app/activity'
 */
        activityForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: activity.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    activity.form = activityForm
const CourierDashboardController = { index, activity }

export default CourierDashboardController