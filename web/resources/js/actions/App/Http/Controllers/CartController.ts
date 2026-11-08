import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CartController::index
 * @see app/Http/Controllers/CartController.php:17
 * @route '/api/cart'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/cart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CartController::index
 * @see app/Http/Controllers/CartController.php:17
 * @route '/api/cart'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CartController::index
 * @see app/Http/Controllers/CartController.php:17
 * @route '/api/cart'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CartController::index
 * @see app/Http/Controllers/CartController.php:17
 * @route '/api/cart'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CartController::index
 * @see app/Http/Controllers/CartController.php:17
 * @route '/api/cart'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CartController::index
 * @see app/Http/Controllers/CartController.php:17
 * @route '/api/cart'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CartController::index
 * @see app/Http/Controllers/CartController.php:17
 * @route '/api/cart'
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
* @see \App\Http\Controllers\CartController::getCount
 * @see app/Http/Controllers/CartController.php:317
 * @route '/api/cart/count'
 */
export const getCount = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCount.url(options),
    method: 'get',
})

getCount.definition = {
    methods: ["get","head"],
    url: '/api/cart/count',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CartController::getCount
 * @see app/Http/Controllers/CartController.php:317
 * @route '/api/cart/count'
 */
getCount.url = (options?: RouteQueryOptions) => {
    return getCount.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CartController::getCount
 * @see app/Http/Controllers/CartController.php:317
 * @route '/api/cart/count'
 */
getCount.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCount.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CartController::getCount
 * @see app/Http/Controllers/CartController.php:317
 * @route '/api/cart/count'
 */
getCount.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getCount.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CartController::getCount
 * @see app/Http/Controllers/CartController.php:317
 * @route '/api/cart/count'
 */
    const getCountForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getCount.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CartController::getCount
 * @see app/Http/Controllers/CartController.php:317
 * @route '/api/cart/count'
 */
        getCountForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCount.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CartController::getCount
 * @see app/Http/Controllers/CartController.php:317
 * @route '/api/cart/count'
 */
        getCountForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCount.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getCount.form = getCountForm
/**
* @see \App\Http\Controllers\CartController::addItem
 * @see app/Http/Controllers/CartController.php:99
 * @route '/api/cart/items'
 */
export const addItem = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(options),
    method: 'post',
})

addItem.definition = {
    methods: ["post"],
    url: '/api/cart/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CartController::addItem
 * @see app/Http/Controllers/CartController.php:99
 * @route '/api/cart/items'
 */
addItem.url = (options?: RouteQueryOptions) => {
    return addItem.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CartController::addItem
 * @see app/Http/Controllers/CartController.php:99
 * @route '/api/cart/items'
 */
addItem.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CartController::addItem
 * @see app/Http/Controllers/CartController.php:99
 * @route '/api/cart/items'
 */
    const addItemForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: addItem.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CartController::addItem
 * @see app/Http/Controllers/CartController.php:99
 * @route '/api/cart/items'
 */
        addItemForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: addItem.url(options),
            method: 'post',
        })
    
    addItem.form = addItemForm
/**
* @see \App\Http\Controllers\CartController::updateItem
 * @see app/Http/Controllers/CartController.php:242
 * @route '/api/cart/items/{id}'
 */
export const updateItem = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateItem.url(args, options),
    method: 'patch',
})

updateItem.definition = {
    methods: ["patch"],
    url: '/api/cart/items/{id}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\CartController::updateItem
 * @see app/Http/Controllers/CartController.php:242
 * @route '/api/cart/items/{id}'
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
* @see \App\Http\Controllers\CartController::updateItem
 * @see app/Http/Controllers/CartController.php:242
 * @route '/api/cart/items/{id}'
 */
updateItem.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateItem.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\CartController::updateItem
 * @see app/Http/Controllers/CartController.php:242
 * @route '/api/cart/items/{id}'
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
* @see \App\Http\Controllers\CartController::updateItem
 * @see app/Http/Controllers/CartController.php:242
 * @route '/api/cart/items/{id}'
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
* @see \App\Http\Controllers\CartController::removeItem
 * @see app/Http/Controllers/CartController.php:294
 * @route '/api/cart/items/{id}'
 */
export const removeItem = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

removeItem.definition = {
    methods: ["delete"],
    url: '/api/cart/items/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CartController::removeItem
 * @see app/Http/Controllers/CartController.php:294
 * @route '/api/cart/items/{id}'
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
* @see \App\Http\Controllers\CartController::removeItem
 * @see app/Http/Controllers/CartController.php:294
 * @route '/api/cart/items/{id}'
 */
removeItem.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\CartController::removeItem
 * @see app/Http/Controllers/CartController.php:294
 * @route '/api/cart/items/{id}'
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
* @see \App\Http\Controllers\CartController::removeItem
 * @see app/Http/Controllers/CartController.php:294
 * @route '/api/cart/items/{id}'
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
const CartController = { index, getCount, addItem, updateItem, removeItem }

export default CartController