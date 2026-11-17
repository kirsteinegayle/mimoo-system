import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::index
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/seller-compliance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::index
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::index
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::index
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::index
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::index
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::index
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
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
* @see \App\Http\Controllers\Admin\SellerComplianceController::warn
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:122
 * @route '/admin/seller-compliance/sellers/{seller}/warn'
 */
export const warn = (args: { seller: string | number } | [seller: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: warn.url(args, options),
    method: 'post',
})

warn.definition = {
    methods: ["post"],
    url: '/admin/seller-compliance/sellers/{seller}/warn',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::warn
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:122
 * @route '/admin/seller-compliance/sellers/{seller}/warn'
 */
warn.url = (args: { seller: string | number } | [seller: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { seller: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    seller: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        seller: args.seller,
                }

    return warn.definition.url
            .replace('{seller}', parsedArgs.seller.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::warn
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:122
 * @route '/admin/seller-compliance/sellers/{seller}/warn'
 */
warn.post = (args: { seller: string | number } | [seller: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: warn.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::warn
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:122
 * @route '/admin/seller-compliance/sellers/{seller}/warn'
 */
    const warnForm = (args: { seller: string | number } | [seller: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: warn.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::warn
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:122
 * @route '/admin/seller-compliance/sellers/{seller}/warn'
 */
        warnForm.post = (args: { seller: string | number } | [seller: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: warn.url(args, options),
            method: 'post',
        })
    
    warn.form = warnForm
/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::hide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:146
 * @route '/admin/seller-compliance/products/{product}/hide'
 */
export const hide = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hide.url(args, options),
    method: 'post',
})

hide.definition = {
    methods: ["post"],
    url: '/admin/seller-compliance/products/{product}/hide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::hide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:146
 * @route '/admin/seller-compliance/products/{product}/hide'
 */
hide.url = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { product: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    product: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        product: args.product,
                }

    return hide.definition.url
            .replace('{product}', parsedArgs.product.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::hide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:146
 * @route '/admin/seller-compliance/products/{product}/hide'
 */
hide.post = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hide.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::hide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:146
 * @route '/admin/seller-compliance/products/{product}/hide'
 */
    const hideForm = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: hide.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::hide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:146
 * @route '/admin/seller-compliance/products/{product}/hide'
 */
        hideForm.post = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: hide.url(args, options),
            method: 'post',
        })
    
    hide.form = hideForm
/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::unhide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:157
 * @route '/admin/seller-compliance/products/{product}/unhide'
 */
export const unhide = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unhide.url(args, options),
    method: 'post',
})

unhide.definition = {
    methods: ["post"],
    url: '/admin/seller-compliance/products/{product}/unhide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::unhide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:157
 * @route '/admin/seller-compliance/products/{product}/unhide'
 */
unhide.url = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { product: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    product: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        product: args.product,
                }

    return unhide.definition.url
            .replace('{product}', parsedArgs.product.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::unhide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:157
 * @route '/admin/seller-compliance/products/{product}/unhide'
 */
unhide.post = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unhide.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::unhide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:157
 * @route '/admin/seller-compliance/products/{product}/unhide'
 */
    const unhideForm = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unhide.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::unhide
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:157
 * @route '/admin/seller-compliance/products/{product}/unhide'
 */
        unhideForm.post = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unhide.url(args, options),
            method: 'post',
        })
    
    unhide.form = unhideForm
/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::remove
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:166
 * @route '/admin/seller-compliance/products/{product}'
 */
export const remove = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

remove.definition = {
    methods: ["delete"],
    url: '/admin/seller-compliance/products/{product}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::remove
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:166
 * @route '/admin/seller-compliance/products/{product}'
 */
remove.url = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { product: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    product: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        product: args.product,
                }

    return remove.definition.url
            .replace('{product}', parsedArgs.product.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::remove
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:166
 * @route '/admin/seller-compliance/products/{product}'
 */
remove.delete = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::remove
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:166
 * @route '/admin/seller-compliance/products/{product}'
 */
    const removeForm = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: remove.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::remove
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:166
 * @route '/admin/seller-compliance/products/{product}'
 */
        removeForm.delete = (args: { product: string | number } | [product: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: remove.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    remove.form = removeForm
const SellerComplianceController = { index, warn, hide, unhide, remove }

export default SellerComplianceController