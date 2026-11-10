import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::index
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:63
 * @route '/api/rider-app/deliveries'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/deliveries',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::index
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:63
 * @route '/api/rider-app/deliveries'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::index
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:63
 * @route '/api/rider-app/deliveries'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::index
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:63
 * @route '/api/rider-app/deliveries'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::index
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:63
 * @route '/api/rider-app/deliveries'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::index
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:63
 * @route '/api/rider-app/deliveries'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::index
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:63
 * @route '/api/rider-app/deliveries'
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
* @see \App\Http\Controllers\Api\RiderDeliveryController::show
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:99
 * @route '/api/rider-app/deliveries/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/deliveries/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::show
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:99
 * @route '/api/rider-app/deliveries/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::show
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:99
 * @route '/api/rider-app/deliveries/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::show
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:99
 * @route '/api/rider-app/deliveries/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::show
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:99
 * @route '/api/rider-app/deliveries/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::show
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:99
 * @route '/api/rider-app/deliveries/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::show
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:99
 * @route '/api/rider-app/deliveries/{id}'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::outForDelivery
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:110
 * @route '/api/rider-app/deliveries/{id}/out-for-delivery'
 */
export const outForDelivery = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: outForDelivery.url(args, options),
    method: 'post',
})

outForDelivery.definition = {
    methods: ["post"],
    url: '/api/rider-app/deliveries/{id}/out-for-delivery',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::outForDelivery
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:110
 * @route '/api/rider-app/deliveries/{id}/out-for-delivery'
 */
outForDelivery.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return outForDelivery.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::outForDelivery
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:110
 * @route '/api/rider-app/deliveries/{id}/out-for-delivery'
 */
outForDelivery.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: outForDelivery.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::outForDelivery
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:110
 * @route '/api/rider-app/deliveries/{id}/out-for-delivery'
 */
    const outForDeliveryForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: outForDelivery.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::outForDelivery
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:110
 * @route '/api/rider-app/deliveries/{id}/out-for-delivery'
 */
        outForDeliveryForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: outForDelivery.url(args, options),
            method: 'post',
        })
    
    outForDelivery.form = outForDeliveryForm
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::requestOtp
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:153
 * @route '/api/rider-app/deliveries/{id}/otp'
 */
export const requestOtp = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(args, options),
    method: 'post',
})

requestOtp.definition = {
    methods: ["post"],
    url: '/api/rider-app/deliveries/{id}/otp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::requestOtp
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:153
 * @route '/api/rider-app/deliveries/{id}/otp'
 */
requestOtp.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return requestOtp.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::requestOtp
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:153
 * @route '/api/rider-app/deliveries/{id}/otp'
 */
requestOtp.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::requestOtp
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:153
 * @route '/api/rider-app/deliveries/{id}/otp'
 */
    const requestOtpForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: requestOtp.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::requestOtp
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:153
 * @route '/api/rider-app/deliveries/{id}/otp'
 */
        requestOtpForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: requestOtp.url(args, options),
            method: 'post',
        })
    
    requestOtp.form = requestOtpForm
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::uploadPod
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:183
 * @route '/api/rider-app/deliveries/{id}/pod'
 */
export const uploadPod = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadPod.url(args, options),
    method: 'post',
})

uploadPod.definition = {
    methods: ["post"],
    url: '/api/rider-app/deliveries/{id}/pod',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::uploadPod
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:183
 * @route '/api/rider-app/deliveries/{id}/pod'
 */
uploadPod.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return uploadPod.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::uploadPod
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:183
 * @route '/api/rider-app/deliveries/{id}/pod'
 */
uploadPod.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadPod.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::uploadPod
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:183
 * @route '/api/rider-app/deliveries/{id}/pod'
 */
    const uploadPodForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadPod.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::uploadPod
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:183
 * @route '/api/rider-app/deliveries/{id}/pod'
 */
        uploadPodForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadPod.url(args, options),
            method: 'post',
        })
    
    uploadPod.form = uploadPodForm
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::deliver
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:217
 * @route '/api/rider-app/deliveries/{id}/deliver'
 */
export const deliver = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deliver.url(args, options),
    method: 'post',
})

deliver.definition = {
    methods: ["post"],
    url: '/api/rider-app/deliveries/{id}/deliver',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::deliver
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:217
 * @route '/api/rider-app/deliveries/{id}/deliver'
 */
deliver.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return deliver.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::deliver
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:217
 * @route '/api/rider-app/deliveries/{id}/deliver'
 */
deliver.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deliver.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::deliver
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:217
 * @route '/api/rider-app/deliveries/{id}/deliver'
 */
    const deliverForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deliver.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::deliver
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:217
 * @route '/api/rider-app/deliveries/{id}/deliver'
 */
        deliverForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deliver.url(args, options),
            method: 'post',
        })
    
    deliver.form = deliverForm
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::fail
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:299
 * @route '/api/rider-app/deliveries/{id}/fail'
 */
export const fail = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fail.url(args, options),
    method: 'post',
})

fail.definition = {
    methods: ["post"],
    url: '/api/rider-app/deliveries/{id}/fail',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::fail
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:299
 * @route '/api/rider-app/deliveries/{id}/fail'
 */
fail.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return fail.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::fail
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:299
 * @route '/api/rider-app/deliveries/{id}/fail'
 */
fail.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fail.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::fail
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:299
 * @route '/api/rider-app/deliveries/{id}/fail'
 */
    const failForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: fail.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::fail
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:299
 * @route '/api/rider-app/deliveries/{id}/fail'
 */
        failForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: fail.url(args, options),
            method: 'post',
        })
    
    fail.form = failForm
/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::returnToSender
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:351
 * @route '/api/rider-app/deliveries/{id}/return'
 */
export const returnToSender = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returnToSender.url(args, options),
    method: 'post',
})

returnToSender.definition = {
    methods: ["post"],
    url: '/api/rider-app/deliveries/{id}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::returnToSender
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:351
 * @route '/api/rider-app/deliveries/{id}/return'
 */
returnToSender.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return returnToSender.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderDeliveryController::returnToSender
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:351
 * @route '/api/rider-app/deliveries/{id}/return'
 */
returnToSender.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returnToSender.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::returnToSender
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:351
 * @route '/api/rider-app/deliveries/{id}/return'
 */
    const returnToSenderForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: returnToSender.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderDeliveryController::returnToSender
 * @see app/Http/Controllers/Api/RiderDeliveryController.php:351
 * @route '/api/rider-app/deliveries/{id}/return'
 */
        returnToSenderForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: returnToSender.url(args, options),
            method: 'post',
        })
    
    returnToSender.form = returnToSenderForm
const RiderDeliveryController = { index, show, outForDelivery, requestOtp, uploadPod, deliver, fail, returnToSender }

export default RiderDeliveryController