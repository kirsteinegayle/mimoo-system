import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:524
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
 * @see app/Http/Controllers/Api/BuyerAccountController.php:524
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
 * @see app/Http/Controllers/Api/BuyerAccountController.php:524
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
servePhoto.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:524
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
servePhoto.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: servePhoto.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:524
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
    const servePhotoForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: servePhoto.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:524
 * @route '/api/buyer/buyer/profile-photo/{filename}'
 */
        servePhotoForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::servePhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:524
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
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/api/buyer/change-password'
 */
const changePasswordf233a90192a443e9e42f463744e76cdd = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePasswordf233a90192a443e9e42f463744e76cdd.url(options),
    method: 'post',
})

changePasswordf233a90192a443e9e42f463744e76cdd.definition = {
    methods: ["post"],
    url: '/api/buyer/change-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/api/buyer/change-password'
 */
changePasswordf233a90192a443e9e42f463744e76cdd.url = (options?: RouteQueryOptions) => {
    return changePasswordf233a90192a443e9e42f463744e76cdd.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/api/buyer/change-password'
 */
changePasswordf233a90192a443e9e42f463744e76cdd.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePasswordf233a90192a443e9e42f463744e76cdd.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/api/buyer/change-password'
 */
    const changePasswordf233a90192a443e9e42f463744e76cddForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePasswordf233a90192a443e9e42f463744e76cdd.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/api/buyer/change-password'
 */
        changePasswordf233a90192a443e9e42f463744e76cddForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePasswordf233a90192a443e9e42f463744e76cdd.url(options),
            method: 'post',
        })
    
    changePasswordf233a90192a443e9e42f463744e76cdd.form = changePasswordf233a90192a443e9e42f463744e76cddForm
    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/buyer/change-password'
 */
const changePassworddc97594050582c67ee40207f12d03121 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePassworddc97594050582c67ee40207f12d03121.url(options),
    method: 'post',
})

changePassworddc97594050582c67ee40207f12d03121.definition = {
    methods: ["post"],
    url: '/buyer/change-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/buyer/change-password'
 */
changePassworddc97594050582c67ee40207f12d03121.url = (options?: RouteQueryOptions) => {
    return changePassworddc97594050582c67ee40207f12d03121.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/buyer/change-password'
 */
changePassworddc97594050582c67ee40207f12d03121.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePassworddc97594050582c67ee40207f12d03121.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/buyer/change-password'
 */
    const changePassworddc97594050582c67ee40207f12d03121Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePassworddc97594050582c67ee40207f12d03121.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePassword
 * @see app/Http/Controllers/Api/BuyerAccountController.php:88
 * @route '/buyer/change-password'
 */
        changePassworddc97594050582c67ee40207f12d03121Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePassworddc97594050582c67ee40207f12d03121.url(options),
            method: 'post',
        })
    
    changePassworddc97594050582c67ee40207f12d03121.form = changePassworddc97594050582c67ee40207f12d03121Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAccountController::changePassword, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `changePassword['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const changePassword = {
    '/api/buyer/change-password': changePasswordf233a90192a443e9e42f463744e76cdd,
    '/buyer/change-password': changePassworddc97594050582c67ee40207f12d03121,
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/api/buyer/change-email/request'
 */
const changeEmailRequest5153163f10824e35959ce882a9c0f893 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailRequest5153163f10824e35959ce882a9c0f893.url(options),
    method: 'post',
})

changeEmailRequest5153163f10824e35959ce882a9c0f893.definition = {
    methods: ["post"],
    url: '/api/buyer/change-email/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/api/buyer/change-email/request'
 */
changeEmailRequest5153163f10824e35959ce882a9c0f893.url = (options?: RouteQueryOptions) => {
    return changeEmailRequest5153163f10824e35959ce882a9c0f893.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/api/buyer/change-email/request'
 */
changeEmailRequest5153163f10824e35959ce882a9c0f893.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailRequest5153163f10824e35959ce882a9c0f893.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/api/buyer/change-email/request'
 */
    const changeEmailRequest5153163f10824e35959ce882a9c0f893Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changeEmailRequest5153163f10824e35959ce882a9c0f893.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/api/buyer/change-email/request'
 */
        changeEmailRequest5153163f10824e35959ce882a9c0f893Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changeEmailRequest5153163f10824e35959ce882a9c0f893.url(options),
            method: 'post',
        })
    
    changeEmailRequest5153163f10824e35959ce882a9c0f893.form = changeEmailRequest5153163f10824e35959ce882a9c0f893Form
    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/buyer/change-email/request'
 */
const changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.url(options),
    method: 'post',
})

changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.definition = {
    methods: ["post"],
    url: '/buyer/change-email/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/buyer/change-email/request'
 */
changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.url = (options?: RouteQueryOptions) => {
    return changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/buyer/change-email/request'
 */
changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/buyer/change-email/request'
 */
    const changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:139
 * @route '/buyer/change-email/request'
 */
        changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.url(options),
            method: 'post',
        })
    
    changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825.form = changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAccountController::changeEmailRequest, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `changeEmailRequest['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const changeEmailRequest = {
    '/api/buyer/change-email/request': changeEmailRequest5153163f10824e35959ce882a9c0f893,
    '/buyer/change-email/request': changeEmailRequest4d29c3834571eaf1a8ea1ebec07a4825,
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/api/buyer/change-email/verify'
 */
const changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.url(options),
    method: 'post',
})

changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.definition = {
    methods: ["post"],
    url: '/api/buyer/change-email/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/api/buyer/change-email/verify'
 */
changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.url = (options?: RouteQueryOptions) => {
    return changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/api/buyer/change-email/verify'
 */
changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/api/buyer/change-email/verify'
 */
    const changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/api/buyer/change-email/verify'
 */
        changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.url(options),
            method: 'post',
        })
    
    changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65.form = changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65Form
    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/buyer/change-email/verify'
 */
const changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.url(options),
    method: 'post',
})

changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.definition = {
    methods: ["post"],
    url: '/buyer/change-email/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/buyer/change-email/verify'
 */
changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.url = (options?: RouteQueryOptions) => {
    return changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/buyer/change-email/verify'
 */
changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/buyer/change-email/verify'
 */
    const changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38fForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:220
 * @route '/buyer/change-email/verify'
 */
        changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38fForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.url(options),
            method: 'post',
        })
    
    changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f.form = changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38fForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAccountController::changeEmailVerify, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `changeEmailVerify['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const changeEmailVerify = {
    '/api/buyer/change-email/verify': changeEmailVerifyaddbf26b53183104ff96adaa89bbdb65,
    '/buyer/change-email/verify': changeEmailVerifyd08adb4f9e7bf00a11caab548f98b38f,
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/api/buyer/change-phone/request'
 */
const changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.url(options),
    method: 'post',
})

changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.definition = {
    methods: ["post"],
    url: '/api/buyer/change-phone/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/api/buyer/change-phone/request'
 */
changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.url = (options?: RouteQueryOptions) => {
    return changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/api/buyer/change-phone/request'
 */
changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/api/buyer/change-phone/request'
 */
    const changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/api/buyer/change-phone/request'
 */
        changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.url(options),
            method: 'post',
        })
    
    changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01.form = changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01Form
    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/buyer/change-phone/request'
 */
const changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.url(options),
    method: 'post',
})

changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.definition = {
    methods: ["post"],
    url: '/buyer/change-phone/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/buyer/change-phone/request'
 */
changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.url = (options?: RouteQueryOptions) => {
    return changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/buyer/change-phone/request'
 */
changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/buyer/change-phone/request'
 */
    const changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest
 * @see app/Http/Controllers/Api/BuyerAccountController.php:300
 * @route '/buyer/change-phone/request'
 */
        changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.url(options),
            method: 'post',
        })
    
    changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92.form = changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAccountController::changePhoneRequest, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `changePhoneRequest['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const changePhoneRequest = {
    '/api/buyer/change-phone/request': changePhoneRequest9fbe4df3066b7c752c338ed36c0eac01,
    '/buyer/change-phone/request': changePhoneRequestaeb3b79c57fd38fac9a485a12f087b92,
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/api/buyer/change-phone/verify'
 */
const changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.url(options),
    method: 'post',
})

changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.definition = {
    methods: ["post"],
    url: '/api/buyer/change-phone/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/api/buyer/change-phone/verify'
 */
changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.url = (options?: RouteQueryOptions) => {
    return changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/api/buyer/change-phone/verify'
 */
changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/api/buyer/change-phone/verify'
 */
    const changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fbForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/api/buyer/change-phone/verify'
 */
        changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fbForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.url(options),
            method: 'post',
        })
    
    changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb.form = changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fbForm
    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/buyer/change-phone/verify'
 */
const changePhoneVerify415e672142a52fc3713c587e4abc2b0b = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneVerify415e672142a52fc3713c587e4abc2b0b.url(options),
    method: 'post',
})

changePhoneVerify415e672142a52fc3713c587e4abc2b0b.definition = {
    methods: ["post"],
    url: '/buyer/change-phone/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/buyer/change-phone/verify'
 */
changePhoneVerify415e672142a52fc3713c587e4abc2b0b.url = (options?: RouteQueryOptions) => {
    return changePhoneVerify415e672142a52fc3713c587e4abc2b0b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/buyer/change-phone/verify'
 */
changePhoneVerify415e672142a52fc3713c587e4abc2b0b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePhoneVerify415e672142a52fc3713c587e4abc2b0b.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/buyer/change-phone/verify'
 */
    const changePhoneVerify415e672142a52fc3713c587e4abc2b0bForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changePhoneVerify415e672142a52fc3713c587e4abc2b0b.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify
 * @see app/Http/Controllers/Api/BuyerAccountController.php:383
 * @route '/buyer/change-phone/verify'
 */
        changePhoneVerify415e672142a52fc3713c587e4abc2b0bForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changePhoneVerify415e672142a52fc3713c587e4abc2b0b.url(options),
            method: 'post',
        })
    
    changePhoneVerify415e672142a52fc3713c587e4abc2b0b.form = changePhoneVerify415e672142a52fc3713c587e4abc2b0bForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAccountController::changePhoneVerify, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `changePhoneVerify['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const changePhoneVerify = {
    '/api/buyer/change-phone/verify': changePhoneVerifyfb58b14f16ba9e7f64d9fba227a5d0fb,
    '/buyer/change-phone/verify': changePhoneVerify415e672142a52fc3713c587e4abc2b0b,
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:456
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
 * @see app/Http/Controllers/Api/BuyerAccountController.php:456
 * @route '/api/buyer/profile/photo'
 */
uploadPhoto.url = (options?: RouteQueryOptions) => {
    return uploadPhoto.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:456
 * @route '/api/buyer/profile/photo'
 */
uploadPhoto.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadPhoto.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:456
 * @route '/api/buyer/profile/photo'
 */
    const uploadPhotoForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadPhoto.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAccountController::uploadPhoto
 * @see app/Http/Controllers/Api/BuyerAccountController.php:456
 * @route '/api/buyer/profile/photo'
 */
        uploadPhotoForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadPhoto.url(options),
            method: 'post',
        })
    
    uploadPhoto.form = uploadPhotoForm
const BuyerAccountController = { servePhoto, changePassword, changeEmailRequest, changeEmailVerify, changePhoneRequest, changePhoneVerify, uploadPhoto }

export default BuyerAccountController