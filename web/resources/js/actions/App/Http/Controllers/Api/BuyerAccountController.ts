import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:512
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
export const servePhoto = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})

servePhoto.definition = {
    methods: ["get","head"],
    url: '/api/buyer/buyer/profile-photo/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:512
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
servePhoto.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return servePhoto.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:512
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
servePhoto.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:512
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
servePhoto.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: servePhoto.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:512
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
    const servePhotoForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: servePhoto.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:512
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
        servePhotoForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:512
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
        servePhotoForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    servePhoto.form = servePhotoForm
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:76
 * @route '/api/buyer/change-password'
 */
export const changePassword = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePassword.url(options),
    method: 'post',
})

changePassword.definition = {
    methods: ["post"],
    url: '/api/buyer/change-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:76
 * @route '/api/buyer/change-password'
 */
changePassword.url = (options?: RouteQueryOptions) => {
    return changePassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:76
 * @route '/api/buyer/change-password'
 */
changePassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePassword.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:76
 * @route '/api/buyer/change-password'
 */
    const changePasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePassword.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:76
 * @route '/api/buyer/change-password'
 */
        changePasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePassword.url(options),
            method: 'post',
        })
    
    changePassword.form = changePasswordForm
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:127
 * @route '/api/buyer/change-email/request'
 */
export const changeEmailRequest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailRequest.url(options),
    method: 'post',
})

changeEmailRequest.definition = {
    methods: ["post"],
    url: '/api/buyer/change-email/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:127
 * @route '/api/buyer/change-email/request'
 */
changeEmailRequest.url = (options?: RouteQueryOptions) => {
    return changeEmailRequest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:127
 * @route '/api/buyer/change-email/request'
 */
changeEmailRequest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailRequest.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:127
 * @route '/api/buyer/change-email/request'
 */
    const changeEmailRequestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changeEmailRequest.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:127
 * @route '/api/buyer/change-email/request'
 */
        changeEmailRequestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changeEmailRequest.url(options),
            method: 'post',
        })
    
    changeEmailRequest.form = changeEmailRequestForm
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:208
 * @route '/api/buyer/change-email/verify'
 */
export const changeEmailVerify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailVerify.url(options),
    method: 'post',
})

changeEmailVerify.definition = {
    methods: ["post"],
    url: '/api/buyer/change-email/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:208
 * @route '/api/buyer/change-email/verify'
 */
changeEmailVerify.url = (options?: RouteQueryOptions) => {
    return changeEmailVerify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:208
 * @route '/api/buyer/change-email/verify'
 */
changeEmailVerify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailVerify.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:208
 * @route '/api/buyer/change-email/verify'
 */
    const changeEmailVerifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changeEmailVerify.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:208
 * @route '/api/buyer/change-email/verify'
 */
        changeEmailVerifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changeEmailVerify.url(options),
            method: 'post',
        })
    
    changeEmailVerify.form = changeEmailVerifyForm
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:288
 * @route '/api/buyer/change-phone/request'
 */
export const changePhoneRequest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneRequest.url(options),
    method: 'post',
})

changePhoneRequest.definition = {
    methods: ["post"],
    url: '/api/buyer/change-phone/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:288
 * @route '/api/buyer/change-phone/request'
 */
changePhoneRequest.url = (options?: RouteQueryOptions) => {
    return changePhoneRequest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:288
 * @route '/api/buyer/change-phone/request'
 */
changePhoneRequest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneRequest.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:288
 * @route '/api/buyer/change-phone/request'
 */
    const changePhoneRequestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePhoneRequest.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:288
 * @route '/api/buyer/change-phone/request'
 */
        changePhoneRequestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePhoneRequest.url(options),
            method: 'post',
        })
    
    changePhoneRequest.form = changePhoneRequestForm
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:371
 * @route '/api/buyer/change-phone/verify'
 */
export const changePhoneVerify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneVerify.url(options),
    method: 'post',
})

changePhoneVerify.definition = {
    methods: ["post"],
    url: '/api/buyer/change-phone/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:371
 * @route '/api/buyer/change-phone/verify'
 */
changePhoneVerify.url = (options?: RouteQueryOptions) => {
    return changePhoneVerify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:371
 * @route '/api/buyer/change-phone/verify'
 */
changePhoneVerify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneVerify.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:371
 * @route '/api/buyer/change-phone/verify'
 */
    const changePhoneVerifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePhoneVerify.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:371
 * @route '/api/buyer/change-phone/verify'
 */
        changePhoneVerifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePhoneVerify.url(options),
            method: 'post',
        })
    
    changePhoneVerify.form = changePhoneVerifyForm
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:444
 * @route '/api/buyer/profile/photo'
 */
export const uploadPhoto = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadPhoto.url(options),
    method: 'post',
})

uploadPhoto.definition = {
    methods: ["post"],
    url: '/api/buyer/profile/photo',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:444
 * @route '/api/buyer/profile/photo'
 */
uploadPhoto.url = (options?: RouteQueryOptions) => {
    return uploadPhoto.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:444
 * @route '/api/buyer/profile/photo'
 */
uploadPhoto.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadPhoto.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:444
 * @route '/api/buyer/profile/photo'
 */
    const uploadPhotoForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadPhoto.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:444
 * @route '/api/buyer/profile/photo'
 */
        uploadPhotoForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadPhoto.url(options),
            method: 'post',
        })
    
    uploadPhoto.form = uploadPhotoForm
const BuyerAccountController = { servePhoto, changePassword, changeEmailRequest, changeEmailVerify, changePhoneRequest, changePhoneVerify, uploadPhoto }

export default BuyerAccountController