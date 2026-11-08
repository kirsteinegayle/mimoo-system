import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ProductController::index
 * @see app/Http/Controllers/Api/ProductController.php:141
 * @route '/api/buyer/products'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/products',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProductController::index
 * @see app/Http/Controllers/Api/ProductController.php:141
 * @route '/api/buyer/products'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProductController::index
 * @see app/Http/Controllers/Api/ProductController.php:141
 * @route '/api/buyer/products'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ProductController::index
 * @see app/Http/Controllers/Api/ProductController.php:141
 * @route '/api/buyer/products'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ProductController::index
 * @see app/Http/Controllers/Api/ProductController.php:141
 * @route '/api/buyer/products'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ProductController::index
 * @see app/Http/Controllers/Api/ProductController.php:141
 * @route '/api/buyer/products'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ProductController::index
 * @see app/Http/Controllers/Api/ProductController.php:141
 * @route '/api/buyer/products'
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
* @see \App\Http\Controllers\Api\ProductController::show
 * @see app/Http/Controllers/Api/ProductController.php:227
 * @route '/api/buyer/products/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/buyer/products/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProductController::show
 * @see app/Http/Controllers/Api/ProductController.php:227
 * @route '/api/buyer/products/{id}'
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
* @see \App\Http\Controllers\Api\ProductController::show
 * @see app/Http/Controllers/Api/ProductController.php:227
 * @route '/api/buyer/products/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ProductController::show
 * @see app/Http/Controllers/Api/ProductController.php:227
 * @route '/api/buyer/products/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ProductController::show
 * @see app/Http/Controllers/Api/ProductController.php:227
 * @route '/api/buyer/products/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ProductController::show
 * @see app/Http/Controllers/Api/ProductController.php:227
 * @route '/api/buyer/products/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ProductController::show
 * @see app/Http/Controllers/Api/ProductController.php:227
 * @route '/api/buyer/products/{id}'
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
* @see \App\Http\Controllers\Api\ProductController::image
 * @see app/Http/Controllers/Api/ProductController.php:270
 * @route '/api/buyer/products/{id}/image/{index?}'
 */
export const image = (args: { id: string | number, index?: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image.url(args, options),
    method: 'get',
})

image.definition = {
    methods: ["get","head"],
    url: '/api/buyer/products/{id}/image/{index?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProductController::image
 * @see app/Http/Controllers/Api/ProductController.php:270
 * @route '/api/buyer/products/{id}/image/{index?}'
 */
image.url = (args: { id: string | number, index?: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                    index: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "index",
        ])

    const parsedArgs = {
                        id: args.id,
                                index: args.index,
                }

    return image.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{index?}', parsedArgs.index?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProductController::image
 * @see app/Http/Controllers/Api/ProductController.php:270
 * @route '/api/buyer/products/{id}/image/{index?}'
 */
image.get = (args: { id: string | number, index?: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ProductController::image
 * @see app/Http/Controllers/Api/ProductController.php:270
 * @route '/api/buyer/products/{id}/image/{index?}'
 */
image.head = (args: { id: string | number, index?: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: image.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ProductController::image
 * @see app/Http/Controllers/Api/ProductController.php:270
 * @route '/api/buyer/products/{id}/image/{index?}'
 */
    const imageForm = (args: { id: string | number, index?: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: image.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ProductController::image
 * @see app/Http/Controllers/Api/ProductController.php:270
 * @route '/api/buyer/products/{id}/image/{index?}'
 */
        imageForm.get = (args: { id: string | number, index?: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ProductController::image
 * @see app/Http/Controllers/Api/ProductController.php:270
 * @route '/api/buyer/products/{id}/image/{index?}'
 */
        imageForm.head = (args: { id: string | number, index?: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    image.form = imageForm
/**
* @see \App\Http\Controllers\Api\ProductController::variantImage
 * @see app/Http/Controllers/Api/ProductController.php:292
 * @route '/api/buyer/products/{id}/variant-image/{variantId}'
 */
export const variantImage = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: variantImage.url(args, options),
    method: 'get',
})

variantImage.definition = {
    methods: ["get","head"],
    url: '/api/buyer/products/{id}/variant-image/{variantId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProductController::variantImage
 * @see app/Http/Controllers/Api/ProductController.php:292
 * @route '/api/buyer/products/{id}/variant-image/{variantId}'
 */
variantImage.url = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions) => {
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

    return variantImage.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{variantId}', parsedArgs.variantId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProductController::variantImage
 * @see app/Http/Controllers/Api/ProductController.php:292
 * @route '/api/buyer/products/{id}/variant-image/{variantId}'
 */
variantImage.get = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: variantImage.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ProductController::variantImage
 * @see app/Http/Controllers/Api/ProductController.php:292
 * @route '/api/buyer/products/{id}/variant-image/{variantId}'
 */
variantImage.head = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: variantImage.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ProductController::variantImage
 * @see app/Http/Controllers/Api/ProductController.php:292
 * @route '/api/buyer/products/{id}/variant-image/{variantId}'
 */
    const variantImageForm = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: variantImage.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ProductController::variantImage
 * @see app/Http/Controllers/Api/ProductController.php:292
 * @route '/api/buyer/products/{id}/variant-image/{variantId}'
 */
        variantImageForm.get = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: variantImage.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ProductController::variantImage
 * @see app/Http/Controllers/Api/ProductController.php:292
 * @route '/api/buyer/products/{id}/variant-image/{variantId}'
 */
        variantImageForm.head = (args: { id: string | number, variantId: string | number } | [id: string | number, variantId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: variantImage.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    variantImage.form = variantImageForm
/**
* @see \App\Http\Controllers\Api\ProductController::categories
 * @see app/Http/Controllers/Api/ProductController.php:204
 * @route '/api/buyer/categories'
 */
export const categories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})

categories.definition = {
    methods: ["get","head"],
    url: '/api/buyer/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProductController::categories
 * @see app/Http/Controllers/Api/ProductController.php:204
 * @route '/api/buyer/categories'
 */
categories.url = (options?: RouteQueryOptions) => {
    return categories.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProductController::categories
 * @see app/Http/Controllers/Api/ProductController.php:204
 * @route '/api/buyer/categories'
 */
categories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ProductController::categories
 * @see app/Http/Controllers/Api/ProductController.php:204
 * @route '/api/buyer/categories'
 */
categories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: categories.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ProductController::categories
 * @see app/Http/Controllers/Api/ProductController.php:204
 * @route '/api/buyer/categories'
 */
    const categoriesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: categories.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ProductController::categories
 * @see app/Http/Controllers/Api/ProductController.php:204
 * @route '/api/buyer/categories'
 */
        categoriesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categories.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ProductController::categories
 * @see app/Http/Controllers/Api/ProductController.php:204
 * @route '/api/buyer/categories'
 */
        categoriesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categories.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    categories.form = categoriesForm
const ProductController = { index, show, image, variantImage, categories }

export default ProductController