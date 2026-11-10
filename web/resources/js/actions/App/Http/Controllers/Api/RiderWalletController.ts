import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RiderWalletController::cod
 * @see app/Http/Controllers/Api/RiderWalletController.php:24
 * @route '/api/rider-app/cod'
 */
export const cod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cod.url(options),
    method: 'get',
})

cod.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/cod',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderWalletController::cod
 * @see app/Http/Controllers/Api/RiderWalletController.php:24
 * @route '/api/rider-app/cod'
 */
cod.url = (options?: RouteQueryOptions) => {
    return cod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderWalletController::cod
 * @see app/Http/Controllers/Api/RiderWalletController.php:24
 * @route '/api/rider-app/cod'
 */
cod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderWalletController::cod
 * @see app/Http/Controllers/Api/RiderWalletController.php:24
 * @route '/api/rider-app/cod'
 */
cod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderWalletController::cod
 * @see app/Http/Controllers/Api/RiderWalletController.php:24
 * @route '/api/rider-app/cod'
 */
    const codForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderWalletController::cod
 * @see app/Http/Controllers/Api/RiderWalletController.php:24
 * @route '/api/rider-app/cod'
 */
        codForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderWalletController::cod
 * @see app/Http/Controllers/Api/RiderWalletController.php:24
 * @route '/api/rider-app/cod'
 */
        codForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cod.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    cod.form = codForm
/**
* @see \App\Http\Controllers\Api\RiderWalletController::remit
 * @see app/Http/Controllers/Api/RiderWalletController.php:47
 * @route '/api/rider-app/cod/remit'
 */
export const remit = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remit.url(options),
    method: 'post',
})

remit.definition = {
    methods: ["post"],
    url: '/api/rider-app/cod/remit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderWalletController::remit
 * @see app/Http/Controllers/Api/RiderWalletController.php:47
 * @route '/api/rider-app/cod/remit'
 */
remit.url = (options?: RouteQueryOptions) => {
    return remit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderWalletController::remit
 * @see app/Http/Controllers/Api/RiderWalletController.php:47
 * @route '/api/rider-app/cod/remit'
 */
remit.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remit.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderWalletController::remit
 * @see app/Http/Controllers/Api/RiderWalletController.php:47
 * @route '/api/rider-app/cod/remit'
 */
    const remitForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: remit.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderWalletController::remit
 * @see app/Http/Controllers/Api/RiderWalletController.php:47
 * @route '/api/rider-app/cod/remit'
 */
        remitForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: remit.url(options),
            method: 'post',
        })
    
    remit.form = remitForm
/**
* @see \App\Http\Controllers\Api\RiderWalletController::earnings
 * @see app/Http/Controllers/Api/RiderWalletController.php:97
 * @route '/api/rider-app/earnings'
 */
export const earnings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})

earnings.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/earnings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderWalletController::earnings
 * @see app/Http/Controllers/Api/RiderWalletController.php:97
 * @route '/api/rider-app/earnings'
 */
earnings.url = (options?: RouteQueryOptions) => {
    return earnings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderWalletController::earnings
 * @see app/Http/Controllers/Api/RiderWalletController.php:97
 * @route '/api/rider-app/earnings'
 */
earnings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderWalletController::earnings
 * @see app/Http/Controllers/Api/RiderWalletController.php:97
 * @route '/api/rider-app/earnings'
 */
earnings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: earnings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderWalletController::earnings
 * @see app/Http/Controllers/Api/RiderWalletController.php:97
 * @route '/api/rider-app/earnings'
 */
    const earningsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: earnings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderWalletController::earnings
 * @see app/Http/Controllers/Api/RiderWalletController.php:97
 * @route '/api/rider-app/earnings'
 */
        earningsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: earnings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderWalletController::earnings
 * @see app/Http/Controllers/Api/RiderWalletController.php:97
 * @route '/api/rider-app/earnings'
 */
        earningsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: earnings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    earnings.form = earningsForm
/**
* @see \App\Http\Controllers\Api\RiderWalletController::notifications
 * @see app/Http/Controllers/Api/RiderWalletController.php:114
 * @route '/api/rider-app/notifications'
 */
export const notifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})

notifications.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RiderWalletController::notifications
 * @see app/Http/Controllers/Api/RiderWalletController.php:114
 * @route '/api/rider-app/notifications'
 */
notifications.url = (options?: RouteQueryOptions) => {
    return notifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderWalletController::notifications
 * @see app/Http/Controllers/Api/RiderWalletController.php:114
 * @route '/api/rider-app/notifications'
 */
notifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RiderWalletController::notifications
 * @see app/Http/Controllers/Api/RiderWalletController.php:114
 * @route '/api/rider-app/notifications'
 */
notifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notifications.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RiderWalletController::notifications
 * @see app/Http/Controllers/Api/RiderWalletController.php:114
 * @route '/api/rider-app/notifications'
 */
    const notificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notifications.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RiderWalletController::notifications
 * @see app/Http/Controllers/Api/RiderWalletController.php:114
 * @route '/api/rider-app/notifications'
 */
        notificationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RiderWalletController::notifications
 * @see app/Http/Controllers/Api/RiderWalletController.php:114
 * @route '/api/rider-app/notifications'
 */
        notificationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notifications.form = notificationsForm
/**
* @see \App\Http\Controllers\Api\RiderWalletController::markRead
 * @see app/Http/Controllers/Api/RiderWalletController.php:134
 * @route '/api/rider-app/notifications/{id}/read'
 */
export const markRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/api/rider-app/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RiderWalletController::markRead
 * @see app/Http/Controllers/Api/RiderWalletController.php:134
 * @route '/api/rider-app/notifications/{id}/read'
 */
markRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RiderWalletController::markRead
 * @see app/Http/Controllers/Api/RiderWalletController.php:134
 * @route '/api/rider-app/notifications/{id}/read'
 */
markRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RiderWalletController::markRead
 * @see app/Http/Controllers/Api/RiderWalletController.php:134
 * @route '/api/rider-app/notifications/{id}/read'
 */
    const markReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RiderWalletController::markRead
 * @see app/Http/Controllers/Api/RiderWalletController.php:134
 * @route '/api/rider-app/notifications/{id}/read'
 */
        markReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markRead.url(args, options),
            method: 'post',
        })
    
    markRead.form = markReadForm
const RiderWalletController = { cod, remit, earnings, notifications, markRead }

export default RiderWalletController