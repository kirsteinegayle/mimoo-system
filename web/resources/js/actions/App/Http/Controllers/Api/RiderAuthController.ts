import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RiderAuthController::login
 * @see app/Http/Controllers/Api/RiderAuthController.php:31
 * @route '/api/rider-app/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/api/rider-app/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderAuthController::login
 * @see app/Http/Controllers/Api/RiderAuthController.php:31
 * @route '/api/rider-app/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderAuthController::login
 * @see app/Http/Controllers/Api/RiderAuthController.php:31
 * @route '/api/rider-app/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderAuthController::login
 * @see app/Http/Controllers/Api/RiderAuthController.php:31
 * @route '/api/rider-app/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderAuthController::login
 * @see app/Http/Controllers/Api/RiderAuthController.php:31
 * @route '/api/rider-app/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
/**
* @see \App\Http\Controllers\Api\RiderAuthController::logout
 * @see app/Http/Controllers/Api/RiderAuthController.php:87
 * @route '/api/rider-app/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/api/rider-app/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderAuthController::logout
 * @see app/Http/Controllers/Api/RiderAuthController.php:87
 * @route '/api/rider-app/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderAuthController::logout
 * @see app/Http/Controllers/Api/RiderAuthController.php:87
 * @route '/api/rider-app/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderAuthController::logout
 * @see app/Http/Controllers/Api/RiderAuthController.php:87
 * @route '/api/rider-app/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderAuthController::logout
 * @see app/Http/Controllers/Api/RiderAuthController.php:87
 * @route '/api/rider-app/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \App\Http\Controllers\Api\RiderAuthController::me
 * @see app/Http/Controllers/Api/RiderAuthController.php:97
 * @route '/api/rider-app/me'
 */
export const me = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

me.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderAuthController::me
 * @see app/Http/Controllers/Api/RiderAuthController.php:97
 * @route '/api/rider-app/me'
 */
me.url = (options?: RouteQueryOptions) => {
    return me.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderAuthController::me
 * @see app/Http/Controllers/Api/RiderAuthController.php:97
 * @route '/api/rider-app/me'
 */
me.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderAuthController::me
 * @see app/Http/Controllers/Api/RiderAuthController.php:97
 * @route '/api/rider-app/me'
 */
me.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: me.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderAuthController::me
 * @see app/Http/Controllers/Api/RiderAuthController.php:97
 * @route '/api/rider-app/me'
 */
    const meForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: me.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderAuthController::me
 * @see app/Http/Controllers/Api/RiderAuthController.php:97
 * @route '/api/rider-app/me'
 */
        meForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: me.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderAuthController::me
 * @see app/Http/Controllers/Api/RiderAuthController.php:97
 * @route '/api/rider-app/me'
 */
        meForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: me.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    me.form = meForm
const RiderAuthController = { login, logout, me }

export default RiderAuthController