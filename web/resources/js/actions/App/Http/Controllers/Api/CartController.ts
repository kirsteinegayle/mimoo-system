import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CartController::index
 * @see app/Http/Controllers/Api/CartController.php:100
 * @route '/api/buyer/cart'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/cart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CartController::index
 * @see app/Http/Controllers/Api/CartController.php:100
 * @route '/api/buyer/cart'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CartController::index
 * @see app/Http/Controllers/Api/CartController.php:100
 * @route '/api/buyer/cart'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CartController::index
 * @see app/Http/Controllers/Api/CartController.php:100
 * @route '/api/buyer/cart'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CartController::index
 * @see app/Http/Controllers/Api/CartController.php:100
 * @route '/api/buyer/cart'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CartController::index
 * @see app/Http/Controllers/Api/CartController.php:100
 * @route '/api/buyer/cart'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CartController::index
 * @see app/Http/Controllers/Api/CartController.php:100
 * @route '/api/buyer/cart'
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
* @see \App\Http\Controllers\Api\CartController::addItem
 * @see app/Http/Controllers/Api/CartController.php:129
 * @route '/api/buyer/cart/items'
 */
export const addItem = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(options),
    method: 'post',
})

addItem.definition = {
    methods: ["post"],
    url: '/api/buyer/cart/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CartController::addItem
 * @see app/Http/Controllers/Api/CartController.php:129
 * @route '/api/buyer/cart/items'
 */
addItem.url = (options?: RouteQueryOptions) => {
    return addItem.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CartController::addItem
 * @see app/Http/Controllers/Api/CartController.php:129
 * @route '/api/buyer/cart/items'
 */
addItem.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CartController::addItem
 * @see app/Http/Controllers/Api/CartController.php:129
 * @route '/api/buyer/cart/items'
 */
    const addItemForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: addItem.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CartController::addItem
 * @see app/Http/Controllers/Api/CartController.php:129
 * @route '/api/buyer/cart/items'
 */
        addItemForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: addItem.url(options),
            method: 'post',
        })
    
    addItem.form = addItemForm
/**
* @see \App\Http\Controllers\Api\CartController::updateItem
 * @see app/Http/Controllers/Api/CartController.php:230
 * @route '/api/buyer/cart/items/{id}'
 */
export const updateItem = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateItem.url(args, options),
    method: 'patch',
})

updateItem.definition = {
    methods: ["patch"],
    url: '/api/buyer/cart/items/{id}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\CartController::updateItem
 * @see app/Http/Controllers/Api/CartController.php:230
 * @route '/api/buyer/cart/items/{id}'
 */
updateItem.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateItem.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CartController::updateItem
 * @see app/Http/Controllers/Api/CartController.php:230
 * @route '/api/buyer/cart/items/{id}'
 */
updateItem.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateItem.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\CartController::updateItem
 * @see app/Http/Controllers/Api/CartController.php:230
 * @route '/api/buyer/cart/items/{id}'
 */
    const updateItemForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateItem.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CartController::updateItem
 * @see app/Http/Controllers/Api/CartController.php:230
 * @route '/api/buyer/cart/items/{id}'
 */
        updateItemForm.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateItem.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateItem.form = updateItemForm
/**
* @see \App\Http\Controllers\Api\CartController::removeItem
 * @see app/Http/Controllers/Api/CartController.php:273
 * @route '/api/buyer/cart/items/{id}'
 */
export const removeItem = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

removeItem.definition = {
    methods: ["delete"],
    url: '/api/buyer/cart/items/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\CartController::removeItem
 * @see app/Http/Controllers/Api/CartController.php:273
 * @route '/api/buyer/cart/items/{id}'
 */
removeItem.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return removeItem.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CartController::removeItem
 * @see app/Http/Controllers/Api/CartController.php:273
 * @route '/api/buyer/cart/items/{id}'
 */
removeItem.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\CartController::removeItem
 * @see app/Http/Controllers/Api/CartController.php:273
 * @route '/api/buyer/cart/items/{id}'
 */
    const removeItemForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: removeItem.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CartController::removeItem
 * @see app/Http/Controllers/Api/CartController.php:273
 * @route '/api/buyer/cart/items/{id}'
 */
        removeItemForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: removeItem.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    removeItem.form = removeItemForm
/**
* @see \App\Http\Controllers\Api\CartController::clear
 * @see app/Http/Controllers/Api/CartController.php:294
 * @route '/api/buyer/cart'
 */
export const clear = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(options),
    method: 'delete',
})

clear.definition = {
    methods: ["delete"],
    url: '/api/buyer/cart',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\CartController::clear
 * @see app/Http/Controllers/Api/CartController.php:294
 * @route '/api/buyer/cart'
 */
clear.url = (options?: RouteQueryOptions) => {
    return clear.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CartController::clear
 * @see app/Http/Controllers/Api/CartController.php:294
 * @route '/api/buyer/cart'
 */
clear.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\CartController::clear
 * @see app/Http/Controllers/Api/CartController.php:294
 * @route '/api/buyer/cart'
 */
    const clearForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clear.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CartController::clear
 * @see app/Http/Controllers/Api/CartController.php:294
 * @route '/api/buyer/cart'
 */
        clearForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clear.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    clear.form = clearForm
const CartController = { index, addItem, updateItem, removeItem, clear }

export default CartController