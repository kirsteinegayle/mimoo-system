import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::showVerification
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
export const showVerification = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showVerification.url(options),
    method: 'get',
})

showVerification.definition = {
    methods: ["get","head"],
    url: '/verify-email',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::showVerification
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
showVerification.url = (options?: RouteQueryOptions) => {
    return showVerification.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::showVerification
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
showVerification.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showVerification.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::showVerification
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
showVerification.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showVerification.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::showVerification
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
    const showVerificationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showVerification.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::showVerification
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
        showVerificationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showVerification.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::showVerification
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:19
 * @route '/verify-email'
 */
        showVerificationForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showVerification.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showVerification.form = showVerificationForm
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verifyOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
export const verifyOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.definition = {
    methods: ["post"],
    url: '/verify-email',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verifyOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
verifyOtp.url = (options?: RouteQueryOptions) => {
    return verifyOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verifyOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
verifyOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verifyOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
    const verifyOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verifyOtp.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::verifyOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:31
 * @route '/verify-email'
 */
        verifyOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verifyOtp.url(options),
            method: 'post',
        })
    
    verifyOtp.form = verifyOtpForm
/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resendOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
export const resendOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendOtp.url(options),
    method: 'post',
})

resendOtp.definition = {
    methods: ["post"],
    url: '/verify-email/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resendOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
resendOtp.url = (options?: RouteQueryOptions) => {
    return resendOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resendOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
resendOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendOtp.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resendOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
    const resendOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resendOtp.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Auth\EmailVerificationController::resendOtp
 * @see app/Http/Controllers/Auth/EmailVerificationController.php:101
 * @route '/verify-email/resend'
 */
        resendOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resendOtp.url(options),
            method: 'post',
        })
    
    resendOtp.form = resendOtpForm
const EmailVerificationController = { showVerification, verifyOtp, resendOtp }

export default EmailVerificationController