import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::riders
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:25
 * @route '/api/courier-app/riders'
 */
export const riders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})

riders.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/riders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::riders
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:25
 * @route '/api/courier-app/riders'
 */
riders.url = (options?: RouteQueryOptions) => {
    return riders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::riders
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:25
 * @route '/api/courier-app/riders'
 */
riders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::riders
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:25
 * @route '/api/courier-app/riders'
 */
riders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: riders.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::riders
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:25
 * @route '/api/courier-app/riders'
 */
    const ridersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: riders.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::riders
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:25
 * @route '/api/courier-app/riders'
 */
        ridersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riders.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::riders
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:25
 * @route '/api/courier-app/riders'
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
* @see \App\Http\Controllers\Api\CourierAppAccountController::profile
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:83
 * @route '/api/courier-app/profile'
 */
export const profile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

profile.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::profile
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:83
 * @route '/api/courier-app/profile'
 */
profile.url = (options?: RouteQueryOptions) => {
    return profile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::profile
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:83
 * @route '/api/courier-app/profile'
 */
profile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::profile
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:83
 * @route '/api/courier-app/profile'
 */
profile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: profile.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::profile
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:83
 * @route '/api/courier-app/profile'
 */
    const profileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: profile.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::profile
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:83
 * @route '/api/courier-app/profile'
 */
        profileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::profile
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:83
 * @route '/api/courier-app/profile'
 */
        profileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    profile.form = profileForm
/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::changePassword
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:104
 * @route '/api/courier-app/profile/change-password'
 */
export const changePassword = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePassword.url(options),
    method: 'post',
})

changePassword.definition = {
    methods: ["post"],
    url: '/api/courier-app/profile/change-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::changePassword
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:104
 * @route '/api/courier-app/profile/change-password'
 */
changePassword.url = (options?: RouteQueryOptions) => {
    return changePassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierAppAccountController::changePassword
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:104
 * @route '/api/courier-app/profile/change-password'
 */
changePassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePassword.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::changePassword
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:104
 * @route '/api/courier-app/profile/change-password'
 */
    const changePasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePassword.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierAppAccountController::changePassword
 * @see app/Http/Controllers/Api/CourierAppAccountController.php:104
 * @route '/api/courier-app/profile/change-password'
 */
        changePasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePassword.url(options),
            method: 'post',
        })
    
    changePassword.form = changePasswordForm
const CourierAppAccountController = { riders, profile, changePassword }

export default CourierAppAccountController