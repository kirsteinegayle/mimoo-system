import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AvatarController::rider
 * @see app/Http/Controllers/Api/AvatarController.php:17
 * @route '/api/avatar/rider/{filename}'
 */
export const rider = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rider.url(args, options),
    method: 'get',
})

rider.definition = {
    methods: ["get","head"],
    url: '/api/avatar/rider/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AvatarController::rider
 * @see app/Http/Controllers/Api/AvatarController.php:17
 * @route '/api/avatar/rider/{filename}'
 */
rider.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return rider.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AvatarController::rider
 * @see app/Http/Controllers/Api/AvatarController.php:17
 * @route '/api/avatar/rider/{filename}'
 */
rider.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rider.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AvatarController::rider
 * @see app/Http/Controllers/Api/AvatarController.php:17
 * @route '/api/avatar/rider/{filename}'
 */
rider.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: rider.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AvatarController::rider
 * @see app/Http/Controllers/Api/AvatarController.php:17
 * @route '/api/avatar/rider/{filename}'
 */
    const riderForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: rider.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AvatarController::rider
 * @see app/Http/Controllers/Api/AvatarController.php:17
 * @route '/api/avatar/rider/{filename}'
 */
        riderForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: rider.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AvatarController::rider
 * @see app/Http/Controllers/Api/AvatarController.php:17
 * @route '/api/avatar/rider/{filename}'
 */
        riderForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: rider.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    rider.form = riderForm
const AvatarController = { rider }

export default AvatarController