import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierAuthController::login
 * @see app/Http/Controllers/Api/CourierAuthController.php:19
 * @route '/api/courier-app/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/api/courier-app/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierAuthController::login
 * @see app/Http/Controllers/Api/CourierAuthController.php:19
 * @route '/api/courier-app/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierAuthController::login
 * @see app/Http/Controllers/Api/CourierAuthController.php:19
 * @route '/api/courier-app/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierAuthController::login
 * @see app/Http/Controllers/Api/CourierAuthController.php:19
 * @route '/api/courier-app/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierAuthController::login
 * @see app/Http/Controllers/Api/CourierAuthController.php:19
 * @route '/api/courier-app/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
/**
* @see \App\Http\Controllers\Api\CourierAuthController::logout
 * @see app/Http/Controllers/Api/CourierAuthController.php:72
 * @route '/api/courier-app/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/api/courier-app/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierAuthController::logout
 * @see app/Http/Controllers/Api/CourierAuthController.php:72
 * @route '/api/courier-app/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierAuthController::logout
 * @see app/Http/Controllers/Api/CourierAuthController.php:72
 * @route '/api/courier-app/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierAuthController::logout
 * @see app/Http/Controllers/Api/CourierAuthController.php:72
 * @route '/api/courier-app/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierAuthController::logout
 * @see app/Http/Controllers/Api/CourierAuthController.php:72
 * @route '/api/courier-app/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \App\Http\Controllers\Api\CourierAuthController::me
 * @see app/Http/Controllers/Api/CourierAuthController.php:82
 * @route '/api/courier-app/me'
 */
export const me = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

me.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierAuthController::me
 * @see app/Http/Controllers/Api/CourierAuthController.php:82
 * @route '/api/courier-app/me'
 */
me.url = (options?: RouteQueryOptions) => {
    return me.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierAuthController::me
 * @see app/Http/Controllers/Api/CourierAuthController.php:82
 * @route '/api/courier-app/me'
 */
me.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierAuthController::me
 * @see app/Http/Controllers/Api/CourierAuthController.php:82
 * @route '/api/courier-app/me'
 */
me.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: me.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierAuthController::me
 * @see app/Http/Controllers/Api/CourierAuthController.php:82
 * @route '/api/courier-app/me'
 */
    const meForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: me.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierAuthController::me
 * @see app/Http/Controllers/Api/CourierAuthController.php:82
 * @route '/api/courier-app/me'
 */
        meForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: me.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierAuthController::me
 * @see app/Http/Controllers/Api/CourierAuthController.php:82
 * @route '/api/courier-app/me'
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
const CourierAuthController = { login, logout, me }

export default CourierAuthController