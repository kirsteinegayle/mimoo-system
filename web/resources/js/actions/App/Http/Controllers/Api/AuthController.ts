import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:21
 * @route '/api/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/api/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:21
 * @route '/api/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:21
 * @route '/api/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:21
 * @route '/api/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:21
 * @route '/api/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
/**
* @see \App\Http\Controllers\Api\AuthController::buyerLogin
 * @see app/Http/Controllers/Api/AuthController.php:53
 * @route '/api/buyer/login'
 */
export const buyerLogin = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerLogin.url(options),
    method: 'post',
})

buyerLogin.definition = {
    methods: ["post"],
    url: '/api/buyer/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::buyerLogin
 * @see app/Http/Controllers/Api/AuthController.php:53
 * @route '/api/buyer/login'
 */
buyerLogin.url = (options?: RouteQueryOptions) => {
    return buyerLogin.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::buyerLogin
 * @see app/Http/Controllers/Api/AuthController.php:53
 * @route '/api/buyer/login'
 */
buyerLogin.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerLogin.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::buyerLogin
 * @see app/Http/Controllers/Api/AuthController.php:53
 * @route '/api/buyer/login'
 */
    const buyerLoginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerLogin.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::buyerLogin
 * @see app/Http/Controllers/Api/AuthController.php:53
 * @route '/api/buyer/login'
 */
        buyerLoginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerLogin.url(options),
            method: 'post',
        })
    
    buyerLogin.form = buyerLoginForm
/**
* @see \App\Http\Controllers\Api\AuthController::buyerRegister
 * @see app/Http/Controllers/Api/AuthController.php:147
 * @route '/api/buyer/register'
 */
export const buyerRegister = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerRegister.url(options),
    method: 'post',
})

buyerRegister.definition = {
    methods: ["post"],
    url: '/api/buyer/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::buyerRegister
 * @see app/Http/Controllers/Api/AuthController.php:147
 * @route '/api/buyer/register'
 */
buyerRegister.url = (options?: RouteQueryOptions) => {
    return buyerRegister.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::buyerRegister
 * @see app/Http/Controllers/Api/AuthController.php:147
 * @route '/api/buyer/register'
 */
buyerRegister.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerRegister.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::buyerRegister
 * @see app/Http/Controllers/Api/AuthController.php:147
 * @route '/api/buyer/register'
 */
    const buyerRegisterForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerRegister.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::buyerRegister
 * @see app/Http/Controllers/Api/AuthController.php:147
 * @route '/api/buyer/register'
 */
        buyerRegisterForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerRegister.url(options),
            method: 'post',
        })
    
    buyerRegister.form = buyerRegisterForm
/**
* @see \App\Http\Controllers\Api\AuthController::buyerVerifyEmail
 * @see app/Http/Controllers/Api/AuthController.php:243
 * @route '/api/buyer/verify-email'
 */
export const buyerVerifyEmail = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerVerifyEmail.url(options),
    method: 'post',
})

buyerVerifyEmail.definition = {
    methods: ["post"],
    url: '/api/buyer/verify-email',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::buyerVerifyEmail
 * @see app/Http/Controllers/Api/AuthController.php:243
 * @route '/api/buyer/verify-email'
 */
buyerVerifyEmail.url = (options?: RouteQueryOptions) => {
    return buyerVerifyEmail.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::buyerVerifyEmail
 * @see app/Http/Controllers/Api/AuthController.php:243
 * @route '/api/buyer/verify-email'
 */
buyerVerifyEmail.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerVerifyEmail.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::buyerVerifyEmail
 * @see app/Http/Controllers/Api/AuthController.php:243
 * @route '/api/buyer/verify-email'
 */
    const buyerVerifyEmailForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerVerifyEmail.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::buyerVerifyEmail
 * @see app/Http/Controllers/Api/AuthController.php:243
 * @route '/api/buyer/verify-email'
 */
        buyerVerifyEmailForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerVerifyEmail.url(options),
            method: 'post',
        })
    
    buyerVerifyEmail.form = buyerVerifyEmailForm
/**
* @see \App\Http\Controllers\Api\AuthController::buyerResendCode
 * @see app/Http/Controllers/Api/AuthController.php:287
 * @route '/api/buyer/resend-code'
 */
export const buyerResendCode = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerResendCode.url(options),
    method: 'post',
})

buyerResendCode.definition = {
    methods: ["post"],
    url: '/api/buyer/resend-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::buyerResendCode
 * @see app/Http/Controllers/Api/AuthController.php:287
 * @route '/api/buyer/resend-code'
 */
buyerResendCode.url = (options?: RouteQueryOptions) => {
    return buyerResendCode.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::buyerResendCode
 * @see app/Http/Controllers/Api/AuthController.php:287
 * @route '/api/buyer/resend-code'
 */
buyerResendCode.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerResendCode.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::buyerResendCode
 * @see app/Http/Controllers/Api/AuthController.php:287
 * @route '/api/buyer/resend-code'
 */
    const buyerResendCodeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerResendCode.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::buyerResendCode
 * @see app/Http/Controllers/Api/AuthController.php:287
 * @route '/api/buyer/resend-code'
 */
        buyerResendCodeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerResendCode.url(options),
            method: 'post',
        })
    
    buyerResendCode.form = buyerResendCodeForm
/**
* @see \App\Http\Controllers\Api\AuthController::buyerLogout
 * @see app/Http/Controllers/Api/AuthController.php:95
 * @route '/api/buyer/logout'
 */
export const buyerLogout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerLogout.url(options),
    method: 'post',
})

buyerLogout.definition = {
    methods: ["post"],
    url: '/api/buyer/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::buyerLogout
 * @see app/Http/Controllers/Api/AuthController.php:95
 * @route '/api/buyer/logout'
 */
buyerLogout.url = (options?: RouteQueryOptions) => {
    return buyerLogout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::buyerLogout
 * @see app/Http/Controllers/Api/AuthController.php:95
 * @route '/api/buyer/logout'
 */
buyerLogout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerLogout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::buyerLogout
 * @see app/Http/Controllers/Api/AuthController.php:95
 * @route '/api/buyer/logout'
 */
    const buyerLogoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerLogout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::buyerLogout
 * @see app/Http/Controllers/Api/AuthController.php:95
 * @route '/api/buyer/logout'
 */
        buyerLogoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerLogout.url(options),
            method: 'post',
        })
    
    buyerLogout.form = buyerLogoutForm
/**
* @see \App\Http\Controllers\Api\AuthController::me
 * @see app/Http/Controllers/Api/AuthController.php:102
 * @route '/api/me'
 */
export const me = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

me.definition = {
    methods: ["get","head"],
    url: '/api/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AuthController::me
 * @see app/Http/Controllers/Api/AuthController.php:102
 * @route '/api/me'
 */
me.url = (options?: RouteQueryOptions) => {
    return me.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::me
 * @see app/Http/Controllers/Api/AuthController.php:102
 * @route '/api/me'
 */
me.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AuthController::me
 * @see app/Http/Controllers/Api/AuthController.php:102
 * @route '/api/me'
 */
me.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: me.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::me
 * @see app/Http/Controllers/Api/AuthController.php:102
 * @route '/api/me'
 */
    const meForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: me.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::me
 * @see app/Http/Controllers/Api/AuthController.php:102
 * @route '/api/me'
 */
        meForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: me.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AuthController::me
 * @see app/Http/Controllers/Api/AuthController.php:102
 * @route '/api/me'
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
/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:121
 * @route '/api/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/api/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:121
 * @route '/api/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:121
 * @route '/api/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:121
 * @route '/api/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:121
 * @route '/api/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
const AuthController = { login, buyerLogin, buyerRegister, buyerVerifyEmail, buyerResendCode, buyerLogout, me, logout }

export default AuthController