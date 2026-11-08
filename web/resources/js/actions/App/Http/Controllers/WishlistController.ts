import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WishlistController::show
 * @see app/Http/Controllers/WishlistController.php:18
 * @route '/wishlist'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/wishlist',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WishlistController::show
 * @see app/Http/Controllers/WishlistController.php:18
 * @route '/wishlist'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WishlistController::show
 * @see app/Http/Controllers/WishlistController.php:18
 * @route '/wishlist'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WishlistController::show
 * @see app/Http/Controllers/WishlistController.php:18
 * @route '/wishlist'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WishlistController::show
 * @see app/Http/Controllers/WishlistController.php:18
 * @route '/wishlist'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WishlistController::show
 * @see app/Http/Controllers/WishlistController.php:18
 * @route '/wishlist'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WishlistController::show
 * @see app/Http/Controllers/WishlistController.php:18
 * @route '/wishlist'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\WishlistController::index
 * @see app/Http/Controllers/WishlistController.php:37
 * @route '/api/wishlist'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/wishlist',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WishlistController::index
 * @see app/Http/Controllers/WishlistController.php:37
 * @route '/api/wishlist'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WishlistController::index
 * @see app/Http/Controllers/WishlistController.php:37
 * @route '/api/wishlist'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WishlistController::index
 * @see app/Http/Controllers/WishlistController.php:37
 * @route '/api/wishlist'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WishlistController::index
 * @see app/Http/Controllers/WishlistController.php:37
 * @route '/api/wishlist'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WishlistController::index
 * @see app/Http/Controllers/WishlistController.php:37
 * @route '/api/wishlist'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WishlistController::index
 * @see app/Http/Controllers/WishlistController.php:37
 * @route '/api/wishlist'
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
* @see \App\Http\Controllers\WishlistController::count
 * @see app/Http/Controllers/WishlistController.php:110
 * @route '/api/wishlist/count'
 */
export const count = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: count.url(options),
    method: 'get',
})

count.definition = {
    methods: ["get","head"],
    url: '/api/wishlist/count',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WishlistController::count
 * @see app/Http/Controllers/WishlistController.php:110
 * @route '/api/wishlist/count'
 */
count.url = (options?: RouteQueryOptions) => {
    return count.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WishlistController::count
 * @see app/Http/Controllers/WishlistController.php:110
 * @route '/api/wishlist/count'
 */
count.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: count.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WishlistController::count
 * @see app/Http/Controllers/WishlistController.php:110
 * @route '/api/wishlist/count'
 */
count.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: count.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WishlistController::count
 * @see app/Http/Controllers/WishlistController.php:110
 * @route '/api/wishlist/count'
 */
    const countForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: count.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WishlistController::count
 * @see app/Http/Controllers/WishlistController.php:110
 * @route '/api/wishlist/count'
 */
        countForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: count.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WishlistController::count
 * @see app/Http/Controllers/WishlistController.php:110
 * @route '/api/wishlist/count'
 */
        countForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: count.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    count.form = countForm
/**
* @see \App\Http\Controllers\WishlistController::check
 * @see app/Http/Controllers/WishlistController.php:128
 * @route '/api/wishlist/check'
 */
export const check = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})

check.definition = {
    methods: ["post"],
    url: '/api/wishlist/check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WishlistController::check
 * @see app/Http/Controllers/WishlistController.php:128
 * @route '/api/wishlist/check'
 */
check.url = (options?: RouteQueryOptions) => {
    return check.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WishlistController::check
 * @see app/Http/Controllers/WishlistController.php:128
 * @route '/api/wishlist/check'
 */
check.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WishlistController::check
 * @see app/Http/Controllers/WishlistController.php:128
 * @route '/api/wishlist/check'
 */
    const checkForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: check.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WishlistController::check
 * @see app/Http/Controllers/WishlistController.php:128
 * @route '/api/wishlist/check'
 */
        checkForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: check.url(options),
            method: 'post',
        })
    
    check.form = checkForm
/**
* @see \App\Http\Controllers\WishlistController::addItem
 * @see app/Http/Controllers/WishlistController.php:158
 * @route '/api/wishlist/items'
 */
export const addItem = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(options),
    method: 'post',
})

addItem.definition = {
    methods: ["post"],
    url: '/api/wishlist/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WishlistController::addItem
 * @see app/Http/Controllers/WishlistController.php:158
 * @route '/api/wishlist/items'
 */
addItem.url = (options?: RouteQueryOptions) => {
    return addItem.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WishlistController::addItem
 * @see app/Http/Controllers/WishlistController.php:158
 * @route '/api/wishlist/items'
 */
addItem.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WishlistController::addItem
 * @see app/Http/Controllers/WishlistController.php:158
 * @route '/api/wishlist/items'
 */
    const addItemForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: addItem.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WishlistController::addItem
 * @see app/Http/Controllers/WishlistController.php:158
 * @route '/api/wishlist/items'
 */
        addItemForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: addItem.url(options),
            method: 'post',
        })
    
    addItem.form = addItemForm
/**
* @see \App\Http\Controllers\WishlistController::removeItem
 * @see app/Http/Controllers/WishlistController.php:243
 * @route '/api/wishlist/items/{id}'
 */
export const removeItem = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

removeItem.definition = {
    methods: ["delete"],
    url: '/api/wishlist/items/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WishlistController::removeItem
 * @see app/Http/Controllers/WishlistController.php:243
 * @route '/api/wishlist/items/{id}'
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
* @see \App\Http\Controllers\WishlistController::removeItem
 * @see app/Http/Controllers/WishlistController.php:243
 * @route '/api/wishlist/items/{id}'
 */
removeItem.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WishlistController::removeItem
 * @see app/Http/Controllers/WishlistController.php:243
 * @route '/api/wishlist/items/{id}'
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
* @see \App\Http\Controllers\WishlistController::removeItem
 * @see app/Http/Controllers/WishlistController.php:243
 * @route '/api/wishlist/items/{id}'
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
* @see \App\Http\Controllers\WishlistController::toggleItem
 * @see app/Http/Controllers/WishlistController.php:265
 * @route '/api/wishlist/toggle'
 */
export const toggleItem = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleItem.url(options),
    method: 'post',
})

toggleItem.definition = {
    methods: ["post"],
    url: '/api/wishlist/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WishlistController::toggleItem
 * @see app/Http/Controllers/WishlistController.php:265
 * @route '/api/wishlist/toggle'
 */
toggleItem.url = (options?: RouteQueryOptions) => {
    return toggleItem.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WishlistController::toggleItem
 * @see app/Http/Controllers/WishlistController.php:265
 * @route '/api/wishlist/toggle'
 */
toggleItem.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleItem.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WishlistController::toggleItem
 * @see app/Http/Controllers/WishlistController.php:265
 * @route '/api/wishlist/toggle'
 */
    const toggleItemForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleItem.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WishlistController::toggleItem
 * @see app/Http/Controllers/WishlistController.php:265
 * @route '/api/wishlist/toggle'
 */
        toggleItemForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleItem.url(options),
            method: 'post',
        })
    
    toggleItem.form = toggleItemForm
const WishlistController = { show, index, count, check, addItem, removeItem, toggleItem }

export default WishlistController