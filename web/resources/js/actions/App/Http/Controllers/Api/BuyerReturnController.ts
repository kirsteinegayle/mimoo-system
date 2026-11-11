import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReturnController.php:194
 * @route '/api/buyer/return-photo/{filename}'
 */
export const servePhoto = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})

servePhoto.definition = {
    methods: ["get","head"],
    url: '/api/buyer/return-photo/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReturnController.php:194
 * @route '/api/buyer/return-photo/{filename}'
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
* @see \App\Http\Controllers\Api\BuyerReturnController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReturnController.php:194
 * @route '/api/buyer/return-photo/{filename}'
 */
servePhoto.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReturnController.php:194
 * @route '/api/buyer/return-photo/{filename}'
 */
servePhoto.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: servePhoto.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReturnController.php:194
 * @route '/api/buyer/return-photo/{filename}'
 */
    const servePhotoForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: servePhoto.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReturnController.php:194
 * @route '/api/buyer/return-photo/{filename}'
 */
        servePhotoForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::servePhoto
 * @see app/Http/Controllers/Api/BuyerReturnController.php:194
 * @route '/api/buyer/return-photo/{filename}'
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
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
const store7ddb6a7edd43f2299cb81da5c7925053 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store7ddb6a7edd43f2299cb81da5c7925053.url(args, options),
    method: 'post',
})

store7ddb6a7edd43f2299cb81da5c7925053.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
store7ddb6a7edd43f2299cb81da5c7925053.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store7ddb6a7edd43f2299cb81da5c7925053.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
store7ddb6a7edd43f2299cb81da5c7925053.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store7ddb6a7edd43f2299cb81da5c7925053.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
    const store7ddb6a7edd43f2299cb81da5c7925053Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store7ddb6a7edd43f2299cb81da5c7925053.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
        store7ddb6a7edd43f2299cb81da5c7925053Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store7ddb6a7edd43f2299cb81da5c7925053.url(args, options),
            method: 'post',
        })
    
    store7ddb6a7edd43f2299cb81da5c7925053.form = store7ddb6a7edd43f2299cb81da5c7925053Form
    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/buyer/orders/{id}/return'
 */
const store009a2693ffa5bc2ebd51cda1ff3e974f = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store009a2693ffa5bc2ebd51cda1ff3e974f.url(args, options),
    method: 'post',
})

store009a2693ffa5bc2ebd51cda1ff3e974f.definition = {
    methods: ["post"],
    url: '/buyer/orders/{id}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/buyer/orders/{id}/return'
 */
store009a2693ffa5bc2ebd51cda1ff3e974f.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store009a2693ffa5bc2ebd51cda1ff3e974f.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/buyer/orders/{id}/return'
 */
store009a2693ffa5bc2ebd51cda1ff3e974f.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store009a2693ffa5bc2ebd51cda1ff3e974f.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/buyer/orders/{id}/return'
 */
    const store009a2693ffa5bc2ebd51cda1ff3e974fForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store009a2693ffa5bc2ebd51cda1ff3e974f.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/buyer/orders/{id}/return'
 */
        store009a2693ffa5bc2ebd51cda1ff3e974fForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store009a2693ffa5bc2ebd51cda1ff3e974f.url(args, options),
            method: 'post',
        })
    
    store009a2693ffa5bc2ebd51cda1ff3e974f.form = store009a2693ffa5bc2ebd51cda1ff3e974fForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerReturnController::store, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `store['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const store = {
    '/api/buyer/orders/{id}/return': store7ddb6a7edd43f2299cb81da5c7925053,
    '/buyer/orders/{id}/return': store009a2693ffa5bc2ebd51cda1ff3e974f,
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
const index018e3b9c6aeb4fa5ff322f4b28f58320 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index018e3b9c6aeb4fa5ff322f4b28f58320.url(options),
    method: 'get',
})

index018e3b9c6aeb4fa5ff322f4b28f58320.definition = {
    methods: ["get","head"],
    url: '/api/buyer/returns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
index018e3b9c6aeb4fa5ff322f4b28f58320.url = (options?: RouteQueryOptions) => {
    return index018e3b9c6aeb4fa5ff322f4b28f58320.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
index018e3b9c6aeb4fa5ff322f4b28f58320.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index018e3b9c6aeb4fa5ff322f4b28f58320.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
index018e3b9c6aeb4fa5ff322f4b28f58320.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index018e3b9c6aeb4fa5ff322f4b28f58320.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
    const index018e3b9c6aeb4fa5ff322f4b28f58320Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index018e3b9c6aeb4fa5ff322f4b28f58320.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
        index018e3b9c6aeb4fa5ff322f4b28f58320Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index018e3b9c6aeb4fa5ff322f4b28f58320.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
        index018e3b9c6aeb4fa5ff322f4b28f58320Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index018e3b9c6aeb4fa5ff322f4b28f58320.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index018e3b9c6aeb4fa5ff322f4b28f58320.form = index018e3b9c6aeb4fa5ff322f4b28f58320Form
    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/buyer/returns'
 */
const index87229e943b7018e2141b775ed552d864 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index87229e943b7018e2141b775ed552d864.url(options),
    method: 'get',
})

index87229e943b7018e2141b775ed552d864.definition = {
    methods: ["get","head"],
    url: '/buyer/returns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/buyer/returns'
 */
index87229e943b7018e2141b775ed552d864.url = (options?: RouteQueryOptions) => {
    return index87229e943b7018e2141b775ed552d864.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/buyer/returns'
 */
index87229e943b7018e2141b775ed552d864.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index87229e943b7018e2141b775ed552d864.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/buyer/returns'
 */
index87229e943b7018e2141b775ed552d864.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index87229e943b7018e2141b775ed552d864.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/buyer/returns'
 */
    const index87229e943b7018e2141b775ed552d864Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index87229e943b7018e2141b775ed552d864.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/buyer/returns'
 */
        index87229e943b7018e2141b775ed552d864Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index87229e943b7018e2141b775ed552d864.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/buyer/returns'
 */
        index87229e943b7018e2141b775ed552d864Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index87229e943b7018e2141b775ed552d864.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index87229e943b7018e2141b775ed552d864.form = index87229e943b7018e2141b775ed552d864Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerReturnController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/returns': index018e3b9c6aeb4fa5ff322f4b28f58320,
    '/buyer/returns': index87229e943b7018e2141b775ed552d864,
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
const show7059b5c4e7c0b354217955c785b8a2b9 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show7059b5c4e7c0b354217955c785b8a2b9.url(args, options),
    method: 'get',
})

show7059b5c4e7c0b354217955c785b8a2b9.definition = {
    methods: ["get","head"],
    url: '/api/buyer/returns/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
show7059b5c4e7c0b354217955c785b8a2b9.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show7059b5c4e7c0b354217955c785b8a2b9.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
show7059b5c4e7c0b354217955c785b8a2b9.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show7059b5c4e7c0b354217955c785b8a2b9.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
show7059b5c4e7c0b354217955c785b8a2b9.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show7059b5c4e7c0b354217955c785b8a2b9.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
    const show7059b5c4e7c0b354217955c785b8a2b9Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show7059b5c4e7c0b354217955c785b8a2b9.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
        show7059b5c4e7c0b354217955c785b8a2b9Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show7059b5c4e7c0b354217955c785b8a2b9.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
        show7059b5c4e7c0b354217955c785b8a2b9Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show7059b5c4e7c0b354217955c785b8a2b9.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show7059b5c4e7c0b354217955c785b8a2b9.form = show7059b5c4e7c0b354217955c785b8a2b9Form
    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/buyer/returns/{id}'
 */
const show3e56708c852cfb9f5a9ae9a9cf3320c6 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show3e56708c852cfb9f5a9ae9a9cf3320c6.url(args, options),
    method: 'get',
})

show3e56708c852cfb9f5a9ae9a9cf3320c6.definition = {
    methods: ["get","head"],
    url: '/buyer/returns/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/buyer/returns/{id}'
 */
show3e56708c852cfb9f5a9ae9a9cf3320c6.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show3e56708c852cfb9f5a9ae9a9cf3320c6.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/buyer/returns/{id}'
 */
show3e56708c852cfb9f5a9ae9a9cf3320c6.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show3e56708c852cfb9f5a9ae9a9cf3320c6.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/buyer/returns/{id}'
 */
show3e56708c852cfb9f5a9ae9a9cf3320c6.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show3e56708c852cfb9f5a9ae9a9cf3320c6.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/buyer/returns/{id}'
 */
    const show3e56708c852cfb9f5a9ae9a9cf3320c6Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show3e56708c852cfb9f5a9ae9a9cf3320c6.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/buyer/returns/{id}'
 */
        show3e56708c852cfb9f5a9ae9a9cf3320c6Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show3e56708c852cfb9f5a9ae9a9cf3320c6.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/buyer/returns/{id}'
 */
        show3e56708c852cfb9f5a9ae9a9cf3320c6Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show3e56708c852cfb9f5a9ae9a9cf3320c6.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show3e56708c852cfb9f5a9ae9a9cf3320c6.form = show3e56708c852cfb9f5a9ae9a9cf3320c6Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerReturnController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/buyer/returns/{id}': show7059b5c4e7c0b354217955c785b8a2b9,
    '/buyer/returns/{id}': show3e56708c852cfb9f5a9ae9a9cf3320c6,
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
const escalate03cffa1cec5ba1651d59b39ff9be10e4 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: escalate03cffa1cec5ba1651d59b39ff9be10e4.url(args, options),
    method: 'post',
})

escalate03cffa1cec5ba1651d59b39ff9be10e4.definition = {
    methods: ["post"],
    url: '/api/buyer/returns/{id}/escalate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
escalate03cffa1cec5ba1651d59b39ff9be10e4.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return escalate03cffa1cec5ba1651d59b39ff9be10e4.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
escalate03cffa1cec5ba1651d59b39ff9be10e4.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: escalate03cffa1cec5ba1651d59b39ff9be10e4.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
    const escalate03cffa1cec5ba1651d59b39ff9be10e4Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: escalate03cffa1cec5ba1651d59b39ff9be10e4.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
        escalate03cffa1cec5ba1651d59b39ff9be10e4Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: escalate03cffa1cec5ba1651d59b39ff9be10e4.url(args, options),
            method: 'post',
        })
    
    escalate03cffa1cec5ba1651d59b39ff9be10e4.form = escalate03cffa1cec5ba1651d59b39ff9be10e4Form
    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/buyer/returns/{id}/escalate'
 */
const escalatebb8a395a2300d8b515967054429d99d4 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: escalatebb8a395a2300d8b515967054429d99d4.url(args, options),
    method: 'post',
})

escalatebb8a395a2300d8b515967054429d99d4.definition = {
    methods: ["post"],
    url: '/buyer/returns/{id}/escalate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/buyer/returns/{id}/escalate'
 */
escalatebb8a395a2300d8b515967054429d99d4.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return escalatebb8a395a2300d8b515967054429d99d4.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/buyer/returns/{id}/escalate'
 */
escalatebb8a395a2300d8b515967054429d99d4.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: escalatebb8a395a2300d8b515967054429d99d4.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/buyer/returns/{id}/escalate'
 */
    const escalatebb8a395a2300d8b515967054429d99d4Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: escalatebb8a395a2300d8b515967054429d99d4.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/buyer/returns/{id}/escalate'
 */
        escalatebb8a395a2300d8b515967054429d99d4Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: escalatebb8a395a2300d8b515967054429d99d4.url(args, options),
            method: 'post',
        })
    
    escalatebb8a395a2300d8b515967054429d99d4.form = escalatebb8a395a2300d8b515967054429d99d4Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerReturnController::escalate, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `escalate['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const escalate = {
    '/api/buyer/returns/{id}/escalate': escalate03cffa1cec5ba1651d59b39ff9be10e4,
    '/buyer/returns/{id}/escalate': escalatebb8a395a2300d8b515967054429d99d4,
}

const BuyerReturnController = { servePhoto, store, index, show, escalate }

export default BuyerReturnController