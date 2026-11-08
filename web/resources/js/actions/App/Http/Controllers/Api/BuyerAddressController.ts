import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/addresses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::index
 * @see app/Http/Controllers/Api/BuyerAddressController.php:115
 * @route '/api/buyer/addresses'
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
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/buyer/addresses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::store
 * @see app/Http/Controllers/Api/BuyerAddressController.php:137
 * @route '/api/buyer/addresses'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/buyer/addresses/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::update
 * @see app/Http/Controllers/Api/BuyerAddressController.php:176
 * @route '/api/buyer/addresses/{id}'
 */
    const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
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
        updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/buyer/addresses/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::destroy
 * @see app/Http/Controllers/Api/BuyerAddressController.php:205
 * @route '/api/buyer/addresses/{id}'
 */
    const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
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
        destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
export const setDefault = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefault.url(args, options),
    method: 'post',
})

setDefault.definition = {
    methods: ["post"],
    url: '/api/buyer/addresses/{id}/default',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
setDefault.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return setDefault.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
setDefault.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefault.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
    const setDefaultForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setDefault.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerAddressController::setDefault
 * @see app/Http/Controllers/Api/BuyerAddressController.php:224
 * @route '/api/buyer/addresses/{id}/default'
 */
        setDefaultForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setDefault.url(args, options),
            method: 'post',
        })
    
    setDefault.form = setDefaultForm
const BuyerAddressController = { index, store, update, destroy, setDefault }

export default BuyerAddressController