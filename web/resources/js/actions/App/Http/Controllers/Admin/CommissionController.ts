import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\CommissionController::index
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/commission',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CommissionController::index
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CommissionController::index
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\CommissionController::index
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\CommissionController::index
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\CommissionController::index
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\CommissionController::index
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
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
const CommissionController = { index }

export default CommissionController