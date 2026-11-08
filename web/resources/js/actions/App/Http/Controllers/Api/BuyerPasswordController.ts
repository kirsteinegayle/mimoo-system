import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerPasswordController::forgotPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:49
 * @route '/api/buyer/forgot-password'
 */
export const forgotPassword = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forgotPassword.url(options),
    method: 'post',
})

forgotPassword.definition = {
    methods: ["post"],
    url: '/api/buyer/forgot-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerPasswordController::forgotPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:49
 * @route '/api/buyer/forgot-password'
 */
forgotPassword.url = (options?: RouteQueryOptions) => {
    return forgotPassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerPasswordController::forgotPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:49
 * @route '/api/buyer/forgot-password'
 */
forgotPassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forgotPassword.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerPasswordController::forgotPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:49
 * @route '/api/buyer/forgot-password'
 */
    const forgotPasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: forgotPassword.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerPasswordController::forgotPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:49
 * @route '/api/buyer/forgot-password'
 */
        forgotPasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: forgotPassword.url(options),
            method: 'post',
        })
    
    forgotPassword.form = forgotPasswordForm
/**
* @see \App\Http\Controllers\Api\BuyerPasswordController::resetPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:98
 * @route '/api/buyer/reset-password'
 */
export const resetPassword = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(options),
    method: 'post',
})

resetPassword.definition = {
    methods: ["post"],
    url: '/api/buyer/reset-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerPasswordController::resetPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:98
 * @route '/api/buyer/reset-password'
 */
resetPassword.url = (options?: RouteQueryOptions) => {
    return resetPassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerPasswordController::resetPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:98
 * @route '/api/buyer/reset-password'
 */
resetPassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerPasswordController::resetPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:98
 * @route '/api/buyer/reset-password'
 */
    const resetPasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resetPassword.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerPasswordController::resetPassword
 * @see app/Http/Controllers/Api/BuyerPasswordController.php:98
 * @route '/api/buyer/reset-password'
 */
        resetPasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resetPassword.url(options),
            method: 'post',
        })
    
    resetPassword.form = resetPasswordForm
const BuyerPasswordController = { forgotPassword, resetPassword }

export default BuyerPasswordController