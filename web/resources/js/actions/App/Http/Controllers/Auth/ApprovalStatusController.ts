import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\ApprovalStatusController::show
 * @see app/Http/Controllers/Auth/ApprovalStatusController.php:33
 * @route '/register/approval-status'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/register/approval-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\ApprovalStatusController::show
 * @see app/Http/Controllers/Auth/ApprovalStatusController.php:33
 * @route '/register/approval-status'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\ApprovalStatusController::show
 * @see app/Http/Controllers/Auth/ApprovalStatusController.php:33
 * @route '/register/approval-status'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\ApprovalStatusController::show
 * @see app/Http/Controllers/Auth/ApprovalStatusController.php:33
 * @route '/register/approval-status'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Auth\ApprovalStatusController::show
 * @see app/Http/Controllers/Auth/ApprovalStatusController.php:33
 * @route '/register/approval-status'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Auth\ApprovalStatusController::show
 * @see app/Http/Controllers/Auth/ApprovalStatusController.php:33
 * @route '/register/approval-status'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Auth\ApprovalStatusController::show
 * @see app/Http/Controllers/Auth/ApprovalStatusController.php:33
 * @route '/register/approval-status'
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
const ApprovalStatusController = { show }

export default ApprovalStatusController