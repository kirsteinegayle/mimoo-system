import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::show
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/verify-email',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::show
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::show
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::show
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::show
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::show
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::show
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verify
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/verify-email',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verify
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verify
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verify
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
    const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verify.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verify
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
        verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verify.url(options),
            method: 'post',
        })
    
    verify.form = verifyForm
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resend
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
export const resend = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(options),
    method: 'post',
})

resend.definition = {
    methods: ["post"],
    url: '/verify-email/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resend
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
resend.url = (options?: RouteQueryOptions) => {
    return resend.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resend
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
resend.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resend
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
    const resendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resend.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resend
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
        resendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resend.url(options),
            method: 'post',
        })
    
    resend.form = resendForm
const otp = {
    show: Object.assign(show, show),
verify: Object.assign(verify, verify),
resend: Object.assign(resend, resend),
}

export default otp