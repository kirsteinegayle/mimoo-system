import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::photo
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
export const photo = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})

photo.definition = {
    methods: ["get","head"],
    url: '/pod/{id}/photo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::photo
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
photo.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return photo.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::photo
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
photo.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::photo
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
photo.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: photo.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::photo
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
    const photoForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: photo.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::photo
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
        photoForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: photo.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryPodPhotoController::photo
 * @see app/Http/Controllers/Api/DeliveryPodPhotoController.php:64
 * @route '/pod/{id}/photo'
 */
        photoForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: photo.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    photo.form = photoForm
const pod = {
    photo: Object.assign(photo, photo),
}

export default pod