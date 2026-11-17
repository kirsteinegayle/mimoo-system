import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/buyer/support/attachments/{id}'
 */
const show089e0b1b8410ddcfb203da282126093d = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show089e0b1b8410ddcfb203da282126093d.url(args, options),
    method: 'get',
})

show089e0b1b8410ddcfb203da282126093d.definition = {
    methods: ["get","head"],
    url: '/api/buyer/support/attachments/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/buyer/support/attachments/{id}'
 */
show089e0b1b8410ddcfb203da282126093d.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show089e0b1b8410ddcfb203da282126093d.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/buyer/support/attachments/{id}'
 */
show089e0b1b8410ddcfb203da282126093d.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show089e0b1b8410ddcfb203da282126093d.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/buyer/support/attachments/{id}'
 */
show089e0b1b8410ddcfb203da282126093d.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show089e0b1b8410ddcfb203da282126093d.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/buyer/support/attachments/{id}'
 */
    const show089e0b1b8410ddcfb203da282126093dForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show089e0b1b8410ddcfb203da282126093d.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/buyer/support/attachments/{id}'
 */
        show089e0b1b8410ddcfb203da282126093dForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show089e0b1b8410ddcfb203da282126093d.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/buyer/support/attachments/{id}'
 */
        show089e0b1b8410ddcfb203da282126093dForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show089e0b1b8410ddcfb203da282126093d.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show089e0b1b8410ddcfb203da282126093d.form = show089e0b1b8410ddcfb203da282126093dForm
    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/courier-app/support/attachments/{id}'
 */
const showa5e7cdd016515222d7544b8244a3e6a2 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showa5e7cdd016515222d7544b8244a3e6a2.url(args, options),
    method: 'get',
})

showa5e7cdd016515222d7544b8244a3e6a2.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/support/attachments/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/courier-app/support/attachments/{id}'
 */
showa5e7cdd016515222d7544b8244a3e6a2.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showa5e7cdd016515222d7544b8244a3e6a2.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/courier-app/support/attachments/{id}'
 */
showa5e7cdd016515222d7544b8244a3e6a2.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showa5e7cdd016515222d7544b8244a3e6a2.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/courier-app/support/attachments/{id}'
 */
showa5e7cdd016515222d7544b8244a3e6a2.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showa5e7cdd016515222d7544b8244a3e6a2.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/courier-app/support/attachments/{id}'
 */
    const showa5e7cdd016515222d7544b8244a3e6a2Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showa5e7cdd016515222d7544b8244a3e6a2.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/courier-app/support/attachments/{id}'
 */
        showa5e7cdd016515222d7544b8244a3e6a2Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showa5e7cdd016515222d7544b8244a3e6a2.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/courier-app/support/attachments/{id}'
 */
        showa5e7cdd016515222d7544b8244a3e6a2Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showa5e7cdd016515222d7544b8244a3e6a2.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showa5e7cdd016515222d7544b8244a3e6a2.form = showa5e7cdd016515222d7544b8244a3e6a2Form
    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/rider-app/support/attachments/{id}'
 */
const show91dcb9feaf0047e977b2a07ec33df888 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show91dcb9feaf0047e977b2a07ec33df888.url(args, options),
    method: 'get',
})

show91dcb9feaf0047e977b2a07ec33df888.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/support/attachments/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/rider-app/support/attachments/{id}'
 */
show91dcb9feaf0047e977b2a07ec33df888.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show91dcb9feaf0047e977b2a07ec33df888.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/rider-app/support/attachments/{id}'
 */
show91dcb9feaf0047e977b2a07ec33df888.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show91dcb9feaf0047e977b2a07ec33df888.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/rider-app/support/attachments/{id}'
 */
show91dcb9feaf0047e977b2a07ec33df888.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show91dcb9feaf0047e977b2a07ec33df888.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/rider-app/support/attachments/{id}'
 */
    const show91dcb9feaf0047e977b2a07ec33df888Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show91dcb9feaf0047e977b2a07ec33df888.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/rider-app/support/attachments/{id}'
 */
        show91dcb9feaf0047e977b2a07ec33df888Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show91dcb9feaf0047e977b2a07ec33df888.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/api/rider-app/support/attachments/{id}'
 */
        show91dcb9feaf0047e977b2a07ec33df888Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show91dcb9feaf0047e977b2a07ec33df888.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show91dcb9feaf0047e977b2a07ec33df888.form = show91dcb9feaf0047e977b2a07ec33df888Form
    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/support/attachments/{id}'
 */
const show0c2762ab873ad09fe83b2eb8f248f206 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show0c2762ab873ad09fe83b2eb8f248f206.url(args, options),
    method: 'get',
})

show0c2762ab873ad09fe83b2eb8f248f206.definition = {
    methods: ["get","head"],
    url: '/support/attachments/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/support/attachments/{id}'
 */
show0c2762ab873ad09fe83b2eb8f248f206.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show0c2762ab873ad09fe83b2eb8f248f206.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/support/attachments/{id}'
 */
show0c2762ab873ad09fe83b2eb8f248f206.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show0c2762ab873ad09fe83b2eb8f248f206.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/support/attachments/{id}'
 */
show0c2762ab873ad09fe83b2eb8f248f206.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show0c2762ab873ad09fe83b2eb8f248f206.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/support/attachments/{id}'
 */
    const show0c2762ab873ad09fe83b2eb8f248f206Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show0c2762ab873ad09fe83b2eb8f248f206.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/support/attachments/{id}'
 */
        show0c2762ab873ad09fe83b2eb8f248f206Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show0c2762ab873ad09fe83b2eb8f248f206.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/support/attachments/{id}'
 */
        show0c2762ab873ad09fe83b2eb8f248f206Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show0c2762ab873ad09fe83b2eb8f248f206.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show0c2762ab873ad09fe83b2eb8f248f206.form = show0c2762ab873ad09fe83b2eb8f248f206Form
    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/admin/support/attachments/{id}'
 */
const show8d9def0c3b573ea6ca5b559687149041 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show8d9def0c3b573ea6ca5b559687149041.url(args, options),
    method: 'get',
})

show8d9def0c3b573ea6ca5b559687149041.definition = {
    methods: ["get","head"],
    url: '/admin/support/attachments/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/admin/support/attachments/{id}'
 */
show8d9def0c3b573ea6ca5b559687149041.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show8d9def0c3b573ea6ca5b559687149041.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/admin/support/attachments/{id}'
 */
show8d9def0c3b573ea6ca5b559687149041.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show8d9def0c3b573ea6ca5b559687149041.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/admin/support/attachments/{id}'
 */
show8d9def0c3b573ea6ca5b559687149041.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show8d9def0c3b573ea6ca5b559687149041.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/admin/support/attachments/{id}'
 */
    const show8d9def0c3b573ea6ca5b559687149041Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show8d9def0c3b573ea6ca5b559687149041.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/admin/support/attachments/{id}'
 */
        show8d9def0c3b573ea6ca5b559687149041Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show8d9def0c3b573ea6ca5b559687149041.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportAttachmentController::show
 * @see app/Http/Controllers/SupportAttachmentController.php:17
 * @route '/admin/support/attachments/{id}'
 */
        show8d9def0c3b573ea6ca5b559687149041Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show8d9def0c3b573ea6ca5b559687149041.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show8d9def0c3b573ea6ca5b559687149041.form = show8d9def0c3b573ea6ca5b559687149041Form

/**
* Multiple routes resolve to \App\Http\Controllers\SupportAttachmentController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/buyer/support/attachments/{id}': show089e0b1b8410ddcfb203da282126093d,
    '/api/courier-app/support/attachments/{id}': showa5e7cdd016515222d7544b8244a3e6a2,
    '/api/rider-app/support/attachments/{id}': show91dcb9feaf0047e977b2a07ec33df888,
    '/support/attachments/{id}': show0c2762ab873ad09fe83b2eb8f248f206,
    '/admin/support/attachments/{id}': show8d9def0c3b573ea6ca5b559687149041,
}

const SupportAttachmentController = { show }

export default SupportAttachmentController