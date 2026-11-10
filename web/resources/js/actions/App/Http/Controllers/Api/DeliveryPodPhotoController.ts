import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:66
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
export const buyerOrderPhoto = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerOrderPhoto.url(args, options),
    method: 'get',
})

buyerOrderPhoto.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}/pod-photo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:66
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
buyerOrderPhoto.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerOrderPhoto.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:66
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
buyerOrderPhoto.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerOrderPhoto.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:66
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
buyerOrderPhoto.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerOrderPhoto.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:66
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
    const buyerOrderPhotoForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerOrderPhoto.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:66
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
        buyerOrderPhotoForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerOrderPhoto.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::buyerOrderPhoto
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:66
 * @route '/api/buyer/orders/{id}/pod-photo'
 */
        buyerOrderPhotoForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerOrderPhoto.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerOrderPhoto.form = buyerOrderPhotoForm
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/delivery-jobs/{id}/pod-photo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
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
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::show
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:45
 * @route '/api/delivery-jobs/{id}/pod-photo'
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
const DeliveryPodPhotoController = { buyerOrderPhoto, show }

export default DeliveryPodPhotoController