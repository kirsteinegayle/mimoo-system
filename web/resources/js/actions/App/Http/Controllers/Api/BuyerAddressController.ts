import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
const index42dae4b18f746a79c3cb9b49407dff12 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index42dae4b18f746a79c3cb9b49407dff12.url(options),
    method: 'get',
})

index42dae4b18f746a79c3cb9b49407dff12.definition = {
    methods: ["get","head"],
    url: '/api/buyer/addresses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
index42dae4b18f746a79c3cb9b49407dff12.url = (options?: RouteQueryOptions) => {
    return index42dae4b18f746a79c3cb9b49407dff12.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
index42dae4b18f746a79c3cb9b49407dff12.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index42dae4b18f746a79c3cb9b49407dff12.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
index42dae4b18f746a79c3cb9b49407dff12.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index42dae4b18f746a79c3cb9b49407dff12.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
    const index42dae4b18f746a79c3cb9b49407dff12Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index42dae4b18f746a79c3cb9b49407dff12.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
        index42dae4b18f746a79c3cb9b49407dff12Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index42dae4b18f746a79c3cb9b49407dff12.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
        index42dae4b18f746a79c3cb9b49407dff12Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index42dae4b18f746a79c3cb9b49407dff12.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index42dae4b18f746a79c3cb9b49407dff12.form = index42dae4b18f746a79c3cb9b49407dff12Form
    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/buyer/addresses'
 */
const index3f673bca2b6fef159500010b980fab67 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index3f673bca2b6fef159500010b980fab67.url(options),
    method: 'get',
})

index3f673bca2b6fef159500010b980fab67.definition = {
    methods: ["get","head"],
    url: '/buyer/addresses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/buyer/addresses'
 */
index3f673bca2b6fef159500010b980fab67.url = (options?: RouteQueryOptions) => {
    return index3f673bca2b6fef159500010b980fab67.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/buyer/addresses'
 */
index3f673bca2b6fef159500010b980fab67.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index3f673bca2b6fef159500010b980fab67.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/buyer/addresses'
 */
index3f673bca2b6fef159500010b980fab67.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index3f673bca2b6fef159500010b980fab67.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/buyer/addresses'
 */
    const index3f673bca2b6fef159500010b980fab67Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index3f673bca2b6fef159500010b980fab67.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/buyer/addresses'
 */
        index3f673bca2b6fef159500010b980fab67Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index3f673bca2b6fef159500010b980fab67.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/buyer/addresses'
 */
        index3f673bca2b6fef159500010b980fab67Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index3f673bca2b6fef159500010b980fab67.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index3f673bca2b6fef159500010b980fab67.form = index3f673bca2b6fef159500010b980fab67Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAddressController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/addresses': index42dae4b18f746a79c3cb9b49407dff12,
    '/buyer/addresses': index3f673bca2b6fef159500010b980fab67,
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
const store42dae4b18f746a79c3cb9b49407dff12 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store42dae4b18f746a79c3cb9b49407dff12.url(options),
    method: 'post',
})

store42dae4b18f746a79c3cb9b49407dff12.definition = {
    methods: ["post"],
    url: '/api/buyer/addresses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
store42dae4b18f746a79c3cb9b49407dff12.url = (options?: RouteQueryOptions) => {
    return store42dae4b18f746a79c3cb9b49407dff12.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
store42dae4b18f746a79c3cb9b49407dff12.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store42dae4b18f746a79c3cb9b49407dff12.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
    const store42dae4b18f746a79c3cb9b49407dff12Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store42dae4b18f746a79c3cb9b49407dff12.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
        store42dae4b18f746a79c3cb9b49407dff12Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store42dae4b18f746a79c3cb9b49407dff12.url(options),
            method: 'post',
        })
    
    store42dae4b18f746a79c3cb9b49407dff12.form = store42dae4b18f746a79c3cb9b49407dff12Form
    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/buyer/addresses'
 */
const store3f673bca2b6fef159500010b980fab67 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store3f673bca2b6fef159500010b980fab67.url(options),
    method: 'post',
})

store3f673bca2b6fef159500010b980fab67.definition = {
    methods: ["post"],
    url: '/buyer/addresses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/buyer/addresses'
 */
store3f673bca2b6fef159500010b980fab67.url = (options?: RouteQueryOptions) => {
    return store3f673bca2b6fef159500010b980fab67.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/buyer/addresses'
 */
store3f673bca2b6fef159500010b980fab67.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store3f673bca2b6fef159500010b980fab67.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/buyer/addresses'
 */
    const store3f673bca2b6fef159500010b980fab67Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store3f673bca2b6fef159500010b980fab67.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/buyer/addresses'
 */
        store3f673bca2b6fef159500010b980fab67Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store3f673bca2b6fef159500010b980fab67.url(options),
            method: 'post',
        })
    
    store3f673bca2b6fef159500010b980fab67.form = store3f673bca2b6fef159500010b980fab67Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAddressController::store, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `store['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const store = {
    '/api/buyer/addresses': store42dae4b18f746a79c3cb9b49407dff12,
    '/buyer/addresses': store3f673bca2b6fef159500010b980fab67,
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
const update6ac7e9e003f8ca3b8a1d741c879f5f39 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, options),
    method: 'put',
})

update6ac7e9e003f8ca3b8a1d741c879f5f39.definition = {
    methods: ["put"],
    url: '/api/buyer/addresses/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
update6ac7e9e003f8ca3b8a1d741c879f5f39.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update6ac7e9e003f8ca3b8a1d741c879f5f39.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
update6ac7e9e003f8ca3b8a1d741c879f5f39.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
    const update6ac7e9e003f8ca3b8a1d741c879f5f39Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
        update6ac7e9e003f8ca3b8a1d741c879f5f39Form.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update6ac7e9e003f8ca3b8a1d741c879f5f39.form = update6ac7e9e003f8ca3b8a1d741c879f5f39Form
    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/buyer/addresses/{id}'
 */
const update3a4684ebdf90561b0ae7075abfec12cd = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update3a4684ebdf90561b0ae7075abfec12cd.url(args, options),
    method: 'put',
})

update3a4684ebdf90561b0ae7075abfec12cd.definition = {
    methods: ["put"],
    url: '/buyer/addresses/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/buyer/addresses/{id}'
 */
update3a4684ebdf90561b0ae7075abfec12cd.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update3a4684ebdf90561b0ae7075abfec12cd.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/buyer/addresses/{id}'
 */
update3a4684ebdf90561b0ae7075abfec12cd.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update3a4684ebdf90561b0ae7075abfec12cd.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/buyer/addresses/{id}'
 */
    const update3a4684ebdf90561b0ae7075abfec12cdForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update3a4684ebdf90561b0ae7075abfec12cd.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/buyer/addresses/{id}'
 */
        update3a4684ebdf90561b0ae7075abfec12cdForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update3a4684ebdf90561b0ae7075abfec12cd.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update3a4684ebdf90561b0ae7075abfec12cd.form = update3a4684ebdf90561b0ae7075abfec12cdForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAddressController::update, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `update['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const update = {
    '/api/buyer/addresses/{id}': update6ac7e9e003f8ca3b8a1d741c879f5f39,
    '/buyer/addresses/{id}': update3a4684ebdf90561b0ae7075abfec12cd,
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
const destroy6ac7e9e003f8ca3b8a1d741c879f5f39 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, options),
    method: 'delete',
})

destroy6ac7e9e003f8ca3b8a1d741c879f5f39.definition = {
    methods: ["delete"],
    url: '/api/buyer/addresses/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
destroy6ac7e9e003f8ca3b8a1d741c879f5f39.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy6ac7e9e003f8ca3b8a1d741c879f5f39.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
destroy6ac7e9e003f8ca3b8a1d741c879f5f39.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
    const destroy6ac7e9e003f8ca3b8a1d741c879f5f39Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
        destroy6ac7e9e003f8ca3b8a1d741c879f5f39Form.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy6ac7e9e003f8ca3b8a1d741c879f5f39.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy6ac7e9e003f8ca3b8a1d741c879f5f39.form = destroy6ac7e9e003f8ca3b8a1d741c879f5f39Form
    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/buyer/addresses/{id}'
 */
const destroy3a4684ebdf90561b0ae7075abfec12cd = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy3a4684ebdf90561b0ae7075abfec12cd.url(args, options),
    method: 'delete',
})

destroy3a4684ebdf90561b0ae7075abfec12cd.definition = {
    methods: ["delete"],
    url: '/buyer/addresses/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/buyer/addresses/{id}'
 */
destroy3a4684ebdf90561b0ae7075abfec12cd.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy3a4684ebdf90561b0ae7075abfec12cd.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/buyer/addresses/{id}'
 */
destroy3a4684ebdf90561b0ae7075abfec12cd.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy3a4684ebdf90561b0ae7075abfec12cd.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/buyer/addresses/{id}'
 */
    const destroy3a4684ebdf90561b0ae7075abfec12cdForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy3a4684ebdf90561b0ae7075abfec12cd.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/buyer/addresses/{id}'
 */
        destroy3a4684ebdf90561b0ae7075abfec12cdForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy3a4684ebdf90561b0ae7075abfec12cd.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy3a4684ebdf90561b0ae7075abfec12cd.form = destroy3a4684ebdf90561b0ae7075abfec12cdForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAddressController::destroy, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `destroy['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const destroy = {
    '/api/buyer/addresses/{id}': destroy6ac7e9e003f8ca3b8a1d741c879f5f39,
    '/buyer/addresses/{id}': destroy3a4684ebdf90561b0ae7075abfec12cd,
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
const setDefault6c8bc40712c81f0d70a18fe663c8c0f4 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefault6c8bc40712c81f0d70a18fe663c8c0f4.url(args, options),
    method: 'post',
})

setDefault6c8bc40712c81f0d70a18fe663c8c0f4.definition = {
    methods: ["post"],
    url: '/api/buyer/addresses/{id}/default',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
setDefault6c8bc40712c81f0d70a18fe663c8c0f4.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return setDefault6c8bc40712c81f0d70a18fe663c8c0f4.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
setDefault6c8bc40712c81f0d70a18fe663c8c0f4.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefault6c8bc40712c81f0d70a18fe663c8c0f4.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
    const setDefault6c8bc40712c81f0d70a18fe663c8c0f4Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setDefault6c8bc40712c81f0d70a18fe663c8c0f4.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
        setDefault6c8bc40712c81f0d70a18fe663c8c0f4Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setDefault6c8bc40712c81f0d70a18fe663c8c0f4.url(args, options),
            method: 'post',
        })
    
    setDefault6c8bc40712c81f0d70a18fe663c8c0f4.form = setDefault6c8bc40712c81f0d70a18fe663c8c0f4Form
    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/buyer/addresses/{id}/default'
 */
const setDefaulte49f7a814887eba333d2a1fbf3b39851 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefaulte49f7a814887eba333d2a1fbf3b39851.url(args, options),
    method: 'post',
})

setDefaulte49f7a814887eba333d2a1fbf3b39851.definition = {
    methods: ["post"],
    url: '/buyer/addresses/{id}/default',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/buyer/addresses/{id}/default'
 */
setDefaulte49f7a814887eba333d2a1fbf3b39851.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return setDefaulte49f7a814887eba333d2a1fbf3b39851.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/buyer/addresses/{id}/default'
 */
setDefaulte49f7a814887eba333d2a1fbf3b39851.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefaulte49f7a814887eba333d2a1fbf3b39851.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/buyer/addresses/{id}/default'
 */
    const setDefaulte49f7a814887eba333d2a1fbf3b39851Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setDefaulte49f7a814887eba333d2a1fbf3b39851.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/buyer/addresses/{id}/default'
 */
        setDefaulte49f7a814887eba333d2a1fbf3b39851Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setDefaulte49f7a814887eba333d2a1fbf3b39851.url(args, options),
            method: 'post',
        })
    
    setDefaulte49f7a814887eba333d2a1fbf3b39851.form = setDefaulte49f7a814887eba333d2a1fbf3b39851Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerAddressController::setDefault, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `setDefault['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const setDefault = {
    '/api/buyer/addresses/{id}/default': setDefault6c8bc40712c81f0d70a18fe663c8c0f4,
    '/buyer/addresses/{id}/default': setDefaulte49f7a814887eba333d2a1fbf3b39851,
}

const BuyerAddressController = { index, store, update, destroy, setDefault }

export default BuyerAddressController