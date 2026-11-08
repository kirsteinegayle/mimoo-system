import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerSellerController::show
 * @see app/Http/Controllers/Api/BuyerSellerController.php:98
 * @route '/api/buyer/sellers/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/buyer/sellers/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerSellerController::show
 * @see app/Http/Controllers/Api/BuyerSellerController.php:98
 * @route '/api/buyer/sellers/{id}'
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
* @see \App\Http\Controllers\Api\BuyerSellerController::show
 * @see app/Http/Controllers/Api/BuyerSellerController.php:98
 * @route '/api/buyer/sellers/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerSellerController::show
 * @see app/Http/Controllers/Api/BuyerSellerController.php:98
 * @route '/api/buyer/sellers/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerSellerController::show
 * @see app/Http/Controllers/Api/BuyerSellerController.php:98
 * @route '/api/buyer/sellers/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerSellerController::show
 * @see app/Http/Controllers/Api/BuyerSellerController.php:98
 * @route '/api/buyer/sellers/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerSellerController::show
 * @see app/Http/Controllers/Api/BuyerSellerController.php:98
 * @route '/api/buyer/sellers/{id}'
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
* @see \App\Http\Controllers\Api\BuyerSellerController::servePhoto
 * @see app/Http/Controllers/Api/BuyerSellerController.php:44
 * @route '/api/buyer/seller-photo/{type}/{filename}'
 */
export const servePhoto = (args: { type: string | number, filename: string | number } | [type: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})

servePhoto.definition = {
    methods: ["get","head"],
    url: '/api/buyer/seller-photo/{type}/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerSellerController::servePhoto
 * @see app/Http/Controllers/Api/BuyerSellerController.php:44
 * @route '/api/buyer/seller-photo/{type}/{filename}'
 */
servePhoto.url = (args: { type: string | number, filename: string | number } | [type: string | number, filename: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    type: args[0],
                    filename: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        type: args.type,
                                filename: args.filename,
                }

    return servePhoto.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerSellerController::servePhoto
 * @see app/Http/Controllers/Api/BuyerSellerController.php:44
 * @route '/api/buyer/seller-photo/{type}/{filename}'
 */
servePhoto.get = (args: { type: string | number, filename: string | number } | [type: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servePhoto.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerSellerController::servePhoto
 * @see app/Http/Controllers/Api/BuyerSellerController.php:44
 * @route '/api/buyer/seller-photo/{type}/{filename}'
 */
servePhoto.head = (args: { type: string | number, filename: string | number } | [type: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: servePhoto.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerSellerController::servePhoto
 * @see app/Http/Controllers/Api/BuyerSellerController.php:44
 * @route '/api/buyer/seller-photo/{type}/{filename}'
 */
    const servePhotoForm = (args: { type: string | number, filename: string | number } | [type: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: servePhoto.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerSellerController::servePhoto
 * @see app/Http/Controllers/Api/BuyerSellerController.php:44
 * @route '/api/buyer/seller-photo/{type}/{filename}'
 */
        servePhotoForm.get = (args: { type: string | number, filename: string | number } | [type: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerSellerController::servePhoto
 * @see app/Http/Controllers/Api/BuyerSellerController.php:44
 * @route '/api/buyer/seller-photo/{type}/{filename}'
 */
        servePhotoForm.head = (args: { type: string | number, filename: string | number } | [type: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servePhoto.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    servePhoto.form = servePhotoForm
const BuyerSellerController = { show, servePhoto }

export default BuyerSellerController