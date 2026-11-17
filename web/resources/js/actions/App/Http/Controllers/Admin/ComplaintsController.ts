import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ComplaintsController::index
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/complaints',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::index
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::index
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ComplaintsController::index
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ComplaintsController::index
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::index
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::index
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
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
* @see \App\Http\Controllers\Admin\ComplaintsController::show
 * @see app/Http/Controllers/Admin/ComplaintsController.php:64
 * @route '/admin/complaints/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/complaints/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::show
 * @see app/Http/Controllers/Admin/ComplaintsController.php:64
 * @route '/admin/complaints/{id}'
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
* @see \App\Http\Controllers\Admin\ComplaintsController::show
 * @see app/Http/Controllers/Admin/ComplaintsController.php:64
 * @route '/admin/complaints/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ComplaintsController::show
 * @see app/Http/Controllers/Admin/ComplaintsController.php:64
 * @route '/admin/complaints/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ComplaintsController::show
 * @see app/Http/Controllers/Admin/ComplaintsController.php:64
 * @route '/admin/complaints/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::show
 * @see app/Http/Controllers/Admin/ComplaintsController.php:64
 * @route '/admin/complaints/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::show
 * @see app/Http/Controllers/Admin/ComplaintsController.php:64
 * @route '/admin/complaints/{id}'
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
* @see \App\Http\Controllers\Admin\ComplaintsController::update
 * @see app/Http/Controllers/Admin/ComplaintsController.php:94
 * @route '/admin/complaints/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/admin/complaints/{id}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::update
 * @see app/Http/Controllers/Admin/ComplaintsController.php:94
 * @route '/admin/complaints/{id}'
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
* @see \App\Http\Controllers\Admin\ComplaintsController::update
 * @see app/Http/Controllers/Admin/ComplaintsController.php:94
 * @route '/admin/complaints/{id}'
 */
update.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ComplaintsController::update
 * @see app/Http/Controllers/Admin/ComplaintsController.php:94
 * @route '/admin/complaints/{id}'
 */
    const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::update
 * @see app/Http/Controllers/Admin/ComplaintsController.php:94
 * @route '/admin/complaints/{id}'
 */
        updateForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, options),
            method: 'post',
        })
    
    update.form = updateForm
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
const ComplaintsController = { index, show, update, evidence }

export default ComplaintsController