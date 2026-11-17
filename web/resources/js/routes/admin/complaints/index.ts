import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ComplaintsController::evidence
 * @see app/Http/Controllers/Admin/ComplaintsController.php:139
 * @route '/admin/complaints/{id}/evidence/{index}'
 */
export const evidence = (args: { id: string | number, index: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evidence.url(args, options),
    method: 'get',
})

evidence.definition = {
    methods: ["get","head"],
    url: '/admin/complaints/{id}/evidence/{index}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::evidence
 * @see app/Http/Controllers/Admin/ComplaintsController.php:139
 * @route '/admin/complaints/{id}/evidence/{index}'
 */
evidence.url = (args: { id: string | number, index: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                    index: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                                index: args.index,
                }

    return evidence.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{index}', parsedArgs.index.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::evidence
 * @see app/Http/Controllers/Admin/ComplaintsController.php:139
 * @route '/admin/complaints/{id}/evidence/{index}'
 */
evidence.get = (args: { id: string | number, index: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evidence.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ComplaintsController::evidence
 * @see app/Http/Controllers/Admin/ComplaintsController.php:139
 * @route '/admin/complaints/{id}/evidence/{index}'
 */
evidence.head = (args: { id: string | number, index: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: evidence.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ComplaintsController::evidence
 * @see app/Http/Controllers/Admin/ComplaintsController.php:139
 * @route '/admin/complaints/{id}/evidence/{index}'
 */
    const evidenceForm = (args: { id: string | number, index: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: evidence.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::evidence
 * @see app/Http/Controllers/Admin/ComplaintsController.php:139
 * @route '/admin/complaints/{id}/evidence/{index}'
 */
        evidenceForm.get = (args: { id: string | number, index: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evidence.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::evidence
 * @see app/Http/Controllers/Admin/ComplaintsController.php:139
 * @route '/admin/complaints/{id}/evidence/{index}'
 */
        evidenceForm.head = (args: { id: string | number, index: string | number } | [id: string | number, index: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: evidence.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    evidence.form = evidenceForm
const complaints = {
    evidence: Object.assign(evidence, evidence),
}

export default complaints