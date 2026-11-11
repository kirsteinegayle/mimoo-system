import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProductController::index
 * @see app/Http/Controllers/ProductController.php:247
 * @route '/api/products'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/products',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::index
 * @see app/Http/Controllers/ProductController.php:247
 * @route '/api/products'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::index
 * @see app/Http/Controllers/ProductController.php:247
 * @route '/api/products'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::index
 * @see app/Http/Controllers/ProductController.php:247
 * @route '/api/products'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::index
 * @see app/Http/Controllers/ProductController.php:247
 * @route '/api/products'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::index
 * @see app/Http/Controllers/ProductController.php:247
 * @route '/api/products'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::index
 * @see app/Http/Controllers/ProductController.php:247
 * @route '/api/products'
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
* @see \App\Http\Controllers\ProductController::show
 * @see app/Http/Controllers/ProductController.php:316
 * @route '/api/products/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/products/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::show
 * @see app/Http/Controllers/ProductController.php:316
 * @route '/api/products/{id}'
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
* @see \App\Http\Controllers\ProductController::show
 * @see app/Http/Controllers/ProductController.php:316
 * @route '/api/products/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::show
 * @see app/Http/Controllers/ProductController.php:316
 * @route '/api/products/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::show
 * @see app/Http/Controllers/ProductController.php:316
 * @route '/api/products/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::show
 * @see app/Http/Controllers/ProductController.php:316
 * @route '/api/products/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::show
 * @see app/Http/Controllers/ProductController.php:316
 * @route '/api/products/{id}'
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
* @see \App\Http\Controllers\ProductController::getSellerStore
 * @see app/Http/Controllers/ProductController.php:1064
 * @route '/api/seller/{id}/store'
 */
export const getSellerStore = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSellerStore.url(args, options),
    method: 'get',
})

getSellerStore.definition = {
    methods: ["get","head"],
    url: '/api/seller/{id}/store',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::getSellerStore
 * @see app/Http/Controllers/ProductController.php:1064
 * @route '/api/seller/{id}/store'
 */
getSellerStore.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getSellerStore.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::getSellerStore
 * @see app/Http/Controllers/ProductController.php:1064
 * @route '/api/seller/{id}/store'
 */
getSellerStore.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSellerStore.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::getSellerStore
 * @see app/Http/Controllers/ProductController.php:1064
 * @route '/api/seller/{id}/store'
 */
getSellerStore.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSellerStore.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::getSellerStore
 * @see app/Http/Controllers/ProductController.php:1064
 * @route '/api/seller/{id}/store'
 */
    const getSellerStoreForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getSellerStore.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::getSellerStore
 * @see app/Http/Controllers/ProductController.php:1064
 * @route '/api/seller/{id}/store'
 */
        getSellerStoreForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getSellerStore.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::getSellerStore
 * @see app/Http/Controllers/ProductController.php:1064
 * @route '/api/seller/{id}/store'
 */
        getSellerStoreForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getSellerStore.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getSellerStore.form = getSellerStoreForm
/**
* @see \App\Http\Controllers\ProductController::reportProduct
 * @see app/Http/Controllers/ProductController.php:873
 * @route '/api/products/{id}/report'
 */
export const reportProduct = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reportProduct.url(args, options),
    method: 'post',
})

reportProduct.definition = {
    methods: ["post"],
    url: '/api/products/{id}/report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProductController::reportProduct
 * @see app/Http/Controllers/ProductController.php:873
 * @route '/api/products/{id}/report'
 */
reportProduct.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reportProduct.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::reportProduct
 * @see app/Http/Controllers/ProductController.php:873
 * @route '/api/products/{id}/report'
 */
reportProduct.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reportProduct.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ProductController::reportProduct
 * @see app/Http/Controllers/ProductController.php:873
 * @route '/api/products/{id}/report'
 */
    const reportProductForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reportProduct.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::reportProduct
 * @see app/Http/Controllers/ProductController.php:873
 * @route '/api/products/{id}/report'
 */
        reportProductForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reportProduct.url(args, options),
            method: 'post',
        })
    
    reportProduct.form = reportProductForm
/**
* @see \App\Http\Controllers\ProductController::sellerIndex
 * @see app/Http/Controllers/ProductController.php:350
 * @route '/api/seller/products'
 */
export const sellerIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerIndex.url(options),
    method: 'get',
})

sellerIndex.definition = {
    methods: ["get","head"],
    url: '/api/seller/products',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::sellerIndex
 * @see app/Http/Controllers/ProductController.php:350
 * @route '/api/seller/products'
 */
sellerIndex.url = (options?: RouteQueryOptions) => {
    return sellerIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::sellerIndex
 * @see app/Http/Controllers/ProductController.php:350
 * @route '/api/seller/products'
 */
sellerIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerIndex.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::sellerIndex
 * @see app/Http/Controllers/ProductController.php:350
 * @route '/api/seller/products'
 */
sellerIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sellerIndex.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::sellerIndex
 * @see app/Http/Controllers/ProductController.php:350
 * @route '/api/seller/products'
 */
    const sellerIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sellerIndex.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::sellerIndex
 * @see app/Http/Controllers/ProductController.php:350
 * @route '/api/seller/products'
 */
        sellerIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerIndex.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::sellerIndex
 * @see app/Http/Controllers/ProductController.php:350
 * @route '/api/seller/products'
 */
        sellerIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerIndex.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    sellerIndex.form = sellerIndexForm
/**
* @see \App\Http\Controllers\ProductController::store
 * @see app/Http/Controllers/ProductController.php:430
 * @route '/api/products'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/products',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProductController::store
 * @see app/Http/Controllers/ProductController.php:430
 * @route '/api/products'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::store
 * @see app/Http/Controllers/ProductController.php:430
 * @route '/api/products'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ProductController::store
 * @see app/Http/Controllers/ProductController.php:430
 * @route '/api/products'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::store
 * @see app/Http/Controllers/ProductController.php:430
 * @route '/api/products'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ProductController::update
 * @see app/Http/Controllers/ProductController.php:543
 * @route '/api/products/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/api/products/{id}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ProductController::update
 * @see app/Http/Controllers/ProductController.php:543
 * @route '/api/products/{id}'
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
* @see \App\Http\Controllers\ProductController::update
 * @see app/Http/Controllers/ProductController.php:543
 * @route '/api/products/{id}'
 */
update.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ProductController::update
 * @see app/Http/Controllers/ProductController.php:543
 * @route '/api/products/{id}'
 */
    const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::update
 * @see app/Http/Controllers/ProductController.php:543
 * @route '/api/products/{id}'
 */
        updateForm.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\ProductController::updateStock
 * @see app/Http/Controllers/ProductController.php:653
 * @route '/api/products/{id}/stock'
 */
export const updateStock = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStock.url(args, options),
    method: 'patch',
})

updateStock.definition = {
    methods: ["patch"],
    url: '/api/products/{id}/stock',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ProductController::updateStock
 * @see app/Http/Controllers/ProductController.php:653
 * @route '/api/products/{id}/stock'
 */
updateStock.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateStock.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::updateStock
 * @see app/Http/Controllers/ProductController.php:653
 * @route '/api/products/{id}/stock'
 */
updateStock.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStock.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ProductController::updateStock
 * @see app/Http/Controllers/ProductController.php:653
 * @route '/api/products/{id}/stock'
 */
    const updateStockForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStock.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::updateStock
 * @see app/Http/Controllers/ProductController.php:653
 * @route '/api/products/{id}/stock'
 */
        updateStockForm.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStock.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStock.form = updateStockForm
/**
* @see \App\Http\Controllers\ProductController::updateVariantStock
 * @see app/Http/Controllers/ProductController.php:721
 * @route '/api/products/{id}/variants/{variantId}/stock'
 */
export const updateVariantStock = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateVariantStock.url(args, options),
    method: 'patch',
})

updateVariantStock.definition = {
    methods: ["patch"],
    url: '/api/products/{id}/variants/{variantId}/stock',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ProductController::updateVariantStock
 * @see app/Http/Controllers/ProductController.php:721
 * @route '/api/products/{id}/variants/{variantId}/stock'
 */
updateVariantStock.url = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                    variantId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                                variantId: args.variantId,
                }

    return updateVariantStock.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{variantId}', parsedArgs.variantId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::updateVariantStock
 * @see app/Http/Controllers/ProductController.php:721
 * @route '/api/products/{id}/variants/{variantId}/stock'
 */
updateVariantStock.patch = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateVariantStock.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ProductController::updateVariantStock
 * @see app/Http/Controllers/ProductController.php:721
 * @route '/api/products/{id}/variants/{variantId}/stock'
 */
    const updateVariantStockForm = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateVariantStock.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::updateVariantStock
 * @see app/Http/Controllers/ProductController.php:721
 * @route '/api/products/{id}/variants/{variantId}/stock'
 */
        updateVariantStockForm.patch = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateVariantStock.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateVariantStock.form = updateVariantStockForm
/**
* @see \App\Http\Controllers\ProductController::destroy
 * @see app/Http/Controllers/ProductController.php:843
 * @route '/api/products/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/products/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProductController::destroy
 * @see app/Http/Controllers/ProductController.php:843
 * @route '/api/products/{id}'
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
* @see \App\Http\Controllers\ProductController::destroy
 * @see app/Http/Controllers/ProductController.php:843
 * @route '/api/products/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ProductController::destroy
 * @see app/Http/Controllers/ProductController.php:843
 * @route '/api/products/{id}'
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
* @see \App\Http\Controllers\ProductController::destroy
 * @see app/Http/Controllers/ProductController.php:843
 * @route '/api/products/{id}'
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
* @see \App\Http\Controllers\ProductController::getStockLogs
 * @see app/Http/Controllers/ProductController.php:812
 * @route '/api/products/{id}/stock-logs'
 */
export const getStockLogs = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStockLogs.url(args, options),
    method: 'get',
})

getStockLogs.definition = {
    methods: ["get","head"],
    url: '/api/products/{id}/stock-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::getStockLogs
 * @see app/Http/Controllers/ProductController.php:812
 * @route '/api/products/{id}/stock-logs'
 */
getStockLogs.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getStockLogs.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::getStockLogs
 * @see app/Http/Controllers/ProductController.php:812
 * @route '/api/products/{id}/stock-logs'
 */
getStockLogs.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStockLogs.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::getStockLogs
 * @see app/Http/Controllers/ProductController.php:812
 * @route '/api/products/{id}/stock-logs'
 */
getStockLogs.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStockLogs.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::getStockLogs
 * @see app/Http/Controllers/ProductController.php:812
 * @route '/api/products/{id}/stock-logs'
 */
    const getStockLogsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getStockLogs.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::getStockLogs
 * @see app/Http/Controllers/ProductController.php:812
 * @route '/api/products/{id}/stock-logs'
 */
        getStockLogsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getStockLogs.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::getStockLogs
 * @see app/Http/Controllers/ProductController.php:812
 * @route '/api/products/{id}/stock-logs'
 */
        getStockLogsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getStockLogs.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getStockLogs.form = getStockLogsForm
/**
* @see \App\Http\Controllers\ProductController::adminPendingProducts
 * @see app/Http/Controllers/ProductController.php:18
 * @route '/api/admin/products/pending'
 */
export const adminPendingProducts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminPendingProducts.url(options),
    method: 'get',
})

adminPendingProducts.definition = {
    methods: ["get","head"],
    url: '/api/admin/products/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::adminPendingProducts
 * @see app/Http/Controllers/ProductController.php:18
 * @route '/api/admin/products/pending'
 */
adminPendingProducts.url = (options?: RouteQueryOptions) => {
    return adminPendingProducts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::adminPendingProducts
 * @see app/Http/Controllers/ProductController.php:18
 * @route '/api/admin/products/pending'
 */
adminPendingProducts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminPendingProducts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::adminPendingProducts
 * @see app/Http/Controllers/ProductController.php:18
 * @route '/api/admin/products/pending'
 */
adminPendingProducts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: adminPendingProducts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::adminPendingProducts
 * @see app/Http/Controllers/ProductController.php:18
 * @route '/api/admin/products/pending'
 */
    const adminPendingProductsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: adminPendingProducts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::adminPendingProducts
 * @see app/Http/Controllers/ProductController.php:18
 * @route '/api/admin/products/pending'
 */
        adminPendingProductsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: adminPendingProducts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::adminPendingProducts
 * @see app/Http/Controllers/ProductController.php:18
 * @route '/api/admin/products/pending'
 */
        adminPendingProductsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: adminPendingProducts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    adminPendingProducts.form = adminPendingProductsForm
/**
* @see \App\Http\Controllers\ProductController::adminAllProducts
 * @see app/Http/Controllers/ProductController.php:173
 * @route '/api/admin/products'
 */
export const adminAllProducts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminAllProducts.url(options),
    method: 'get',
})

adminAllProducts.definition = {
    methods: ["get","head"],
    url: '/api/admin/products',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::adminAllProducts
 * @see app/Http/Controllers/ProductController.php:173
 * @route '/api/admin/products'
 */
adminAllProducts.url = (options?: RouteQueryOptions) => {
    return adminAllProducts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::adminAllProducts
 * @see app/Http/Controllers/ProductController.php:173
 * @route '/api/admin/products'
 */
adminAllProducts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminAllProducts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::adminAllProducts
 * @see app/Http/Controllers/ProductController.php:173
 * @route '/api/admin/products'
 */
adminAllProducts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: adminAllProducts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::adminAllProducts
 * @see app/Http/Controllers/ProductController.php:173
 * @route '/api/admin/products'
 */
    const adminAllProductsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: adminAllProducts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::adminAllProducts
 * @see app/Http/Controllers/ProductController.php:173
 * @route '/api/admin/products'
 */
        adminAllProductsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: adminAllProducts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::adminAllProducts
 * @see app/Http/Controllers/ProductController.php:173
 * @route '/api/admin/products'
 */
        adminAllProductsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: adminAllProducts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    adminAllProducts.form = adminAllProductsForm
/**
* @see \App\Http\Controllers\ProductController::adminApproveProduct
 * @see app/Http/Controllers/ProductController.php:84
 * @route '/api/admin/products/{id}/approve'
 */
export const adminApproveProduct = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminApproveProduct.url(args, options),
    method: 'post',
})

adminApproveProduct.definition = {
    methods: ["post"],
    url: '/api/admin/products/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProductController::adminApproveProduct
 * @see app/Http/Controllers/ProductController.php:84
 * @route '/api/admin/products/{id}/approve'
 */
adminApproveProduct.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return adminApproveProduct.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::adminApproveProduct
 * @see app/Http/Controllers/ProductController.php:84
 * @route '/api/admin/products/{id}/approve'
 */
adminApproveProduct.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminApproveProduct.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ProductController::adminApproveProduct
 * @see app/Http/Controllers/ProductController.php:84
 * @route '/api/admin/products/{id}/approve'
 */
    const adminApproveProductForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: adminApproveProduct.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::adminApproveProduct
 * @see app/Http/Controllers/ProductController.php:84
 * @route '/api/admin/products/{id}/approve'
 */
        adminApproveProductForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: adminApproveProduct.url(args, options),
            method: 'post',
        })
    
    adminApproveProduct.form = adminApproveProductForm
/**
* @see \App\Http\Controllers\ProductController::adminRejectProduct
 * @see app/Http/Controllers/ProductController.php:128
 * @route '/api/admin/products/{id}/reject'
 */
export const adminRejectProduct = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminRejectProduct.url(args, options),
    method: 'post',
})

adminRejectProduct.definition = {
    methods: ["post"],
    url: '/api/admin/products/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProductController::adminRejectProduct
 * @see app/Http/Controllers/ProductController.php:128
 * @route '/api/admin/products/{id}/reject'
 */
adminRejectProduct.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return adminRejectProduct.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::adminRejectProduct
 * @see app/Http/Controllers/ProductController.php:128
 * @route '/api/admin/products/{id}/reject'
 */
adminRejectProduct.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminRejectProduct.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ProductController::adminRejectProduct
 * @see app/Http/Controllers/ProductController.php:128
 * @route '/api/admin/products/{id}/reject'
 */
    const adminRejectProductForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: adminRejectProduct.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::adminRejectProduct
 * @see app/Http/Controllers/ProductController.php:128
 * @route '/api/admin/products/{id}/reject'
 */
        adminRejectProductForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: adminRejectProduct.url(args, options),
            method: 'post',
        })
    
    adminRejectProduct.form = adminRejectProductForm
/**
* @see \App\Http\Controllers\ProductController::adminGetReports
 * @see app/Http/Controllers/ProductController.php:908
 * @route '/api/admin/reports'
 */
export const adminGetReports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminGetReports.url(options),
    method: 'get',
})

adminGetReports.definition = {
    methods: ["get","head"],
    url: '/api/admin/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProductController::adminGetReports
 * @see app/Http/Controllers/ProductController.php:908
 * @route '/api/admin/reports'
 */
adminGetReports.url = (options?: RouteQueryOptions) => {
    return adminGetReports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::adminGetReports
 * @see app/Http/Controllers/ProductController.php:908
 * @route '/api/admin/reports'
 */
adminGetReports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminGetReports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProductController::adminGetReports
 * @see app/Http/Controllers/ProductController.php:908
 * @route '/api/admin/reports'
 */
adminGetReports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: adminGetReports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProductController::adminGetReports
 * @see app/Http/Controllers/ProductController.php:908
 * @route '/api/admin/reports'
 */
    const adminGetReportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: adminGetReports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProductController::adminGetReports
 * @see app/Http/Controllers/ProductController.php:908
 * @route '/api/admin/reports'
 */
        adminGetReportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: adminGetReports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProductController::adminGetReports
 * @see app/Http/Controllers/ProductController.php:908
 * @route '/api/admin/reports'
 */
        adminGetReportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: adminGetReports.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    adminGetReports.form = adminGetReportsForm
/**
* @see \App\Http\Controllers\ProductController::adminApproveReport
 * @see app/Http/Controllers/ProductController.php:965
 * @route '/api/admin/reports/{id}/approve'
 */
export const adminApproveReport = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminApproveReport.url(args, options),
    method: 'post',
})

adminApproveReport.definition = {
    methods: ["post"],
    url: '/api/admin/reports/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProductController::adminApproveReport
 * @see app/Http/Controllers/ProductController.php:965
 * @route '/api/admin/reports/{id}/approve'
 */
adminApproveReport.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return adminApproveReport.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::adminApproveReport
 * @see app/Http/Controllers/ProductController.php:965
 * @route '/api/admin/reports/{id}/approve'
 */
adminApproveReport.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminApproveReport.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ProductController::adminApproveReport
 * @see app/Http/Controllers/ProductController.php:965
 * @route '/api/admin/reports/{id}/approve'
 */
    const adminApproveReportForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: adminApproveReport.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::adminApproveReport
 * @see app/Http/Controllers/ProductController.php:965
 * @route '/api/admin/reports/{id}/approve'
 */
        adminApproveReportForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: adminApproveReport.url(args, options),
            method: 'post',
        })
    
    adminApproveReport.form = adminApproveReportForm
/**
* @see \App\Http\Controllers\ProductController::adminRejectReport
 * @see app/Http/Controllers/ProductController.php:1017
 * @route '/api/admin/reports/{id}/reject'
 */
export const adminRejectReport = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminRejectReport.url(args, options),
    method: 'post',
})

adminRejectReport.definition = {
    methods: ["post"],
    url: '/api/admin/reports/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProductController::adminRejectReport
 * @see app/Http/Controllers/ProductController.php:1017
 * @route '/api/admin/reports/{id}/reject'
 */
adminRejectReport.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return adminRejectReport.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProductController::adminRejectReport
 * @see app/Http/Controllers/ProductController.php:1017
 * @route '/api/admin/reports/{id}/reject'
 */
adminRejectReport.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adminRejectReport.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ProductController::adminRejectReport
 * @see app/Http/Controllers/ProductController.php:1017
 * @route '/api/admin/reports/{id}/reject'
 */
    const adminRejectReportForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: adminRejectReport.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProductController::adminRejectReport
 * @see app/Http/Controllers/ProductController.php:1017
 * @route '/api/admin/reports/{id}/reject'
 */
        adminRejectReportForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: adminRejectReport.url(args, options),
            method: 'post',
        })
    
    adminRejectReport.form = adminRejectReportForm
const ProductController = { index, show, getSellerStore, reportProduct, sellerIndex, store, update, updateStock, updateVariantStock, destroy, getStockLogs, adminPendingProducts, adminAllProducts, adminApproveProduct, adminRejectProduct, adminGetReports, adminApproveReport, adminRejectReport }

export default ProductController