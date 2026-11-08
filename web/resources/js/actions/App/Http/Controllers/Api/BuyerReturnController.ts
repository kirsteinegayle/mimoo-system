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
export const store = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/return',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
store.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
store.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
    const storeForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::store
 * @see app/Http/Controllers/Api/BuyerReturnController.php:61
 * @route '/api/buyer/orders/{id}/return'
 */
        storeForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/returns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::index
 * @see app/Http/Controllers/Api/BuyerReturnController.php:140
 * @route '/api/buyer/returns'
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
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/buyer/returns/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
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
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::show
 * @see app/Http/Controllers/Api/BuyerReturnController.php:153
 * @route '/api/buyer/returns/{id}'
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
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
export const escalate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: escalate.url(args, options),
    method: 'post',
})

escalate.definition = {
    methods: ["post"],
    url: '/api/buyer/returns/{id}/escalate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
escalate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return escalate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
escalate.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: escalate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
    const escalateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: escalate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerReturnController::escalate
 * @see app/Http/Controllers/Api/BuyerReturnController.php:166
 * @route '/api/buyer/returns/{id}/escalate'
 */
        escalateForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: escalate.url(args, options),
            method: 'post',
        })
    
    escalate.form = escalateForm
const BuyerReturnController = { servePhoto, store, index, show, escalate }

export default BuyerReturnController