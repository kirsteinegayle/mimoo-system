import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::index
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:44
 * @route '/logistics/facilities/{id}/checklist'
 */
export const index = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/logistics/facilities/{id}/checklist',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::index
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:44
 * @route '/logistics/facilities/{id}/checklist'
 */
index.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::index
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:44
 * @route '/logistics/facilities/{id}/checklist'
 */
index.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::index
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:44
 * @route '/logistics/facilities/{id}/checklist'
 */
index.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::index
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:44
 * @route '/logistics/facilities/{id}/checklist'
 */
    const indexForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::index
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:44
 * @route '/logistics/facilities/{id}/checklist'
 */
        indexForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::index
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:44
 * @route '/logistics/facilities/{id}/checklist'
 */
        indexForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::store
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:57
 * @route '/logistics/facilities/{id}/checklist'
 */
export const store = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/logistics/facilities/{id}/checklist',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::store
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:57
 * @route '/logistics/facilities/{id}/checklist'
 */
store.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::store
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:57
 * @route '/logistics/facilities/{id}/checklist'
 */
store.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::store
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:57
 * @route '/logistics/facilities/{id}/checklist'
 */
    const storeForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::store
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:57
 * @route '/logistics/facilities/{id}/checklist'
 */
        storeForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::reset
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:103
 * @route '/logistics/facilities/{id}/checklist/reset'
 */
export const reset = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(args, options),
    method: 'post',
})

reset.definition = {
    methods: ["post"],
    url: '/logistics/facilities/{id}/checklist/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::reset
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:103
 * @route '/logistics/facilities/{id}/checklist/reset'
 */
reset.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reset.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::reset
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:103
 * @route '/logistics/facilities/{id}/checklist/reset'
 */
reset.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::reset
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:103
 * @route '/logistics/facilities/{id}/checklist/reset'
 */
    const resetForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reset.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::reset
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:103
 * @route '/logistics/facilities/{id}/checklist/reset'
 */
        resetForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reset.url(args, options),
            method: 'post',
        })
    
    reset.form = resetForm
/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::update
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:73
 * @route '/logistics/checklist-items/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/logistics/checklist-items/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::update
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:73
 * @route '/logistics/checklist-items/{id}'
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
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::update
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:73
 * @route '/logistics/checklist-items/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::update
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:73
 * @route '/logistics/checklist-items/{id}'
 */
    const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::update
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:73
 * @route '/logistics/checklist-items/{id}'
 */
        updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::destroy
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:93
 * @route '/logistics/checklist-items/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/logistics/checklist-items/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::destroy
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:93
 * @route '/logistics/checklist-items/{id}'
 */
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::destroy
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:93
 * @route '/logistics/checklist-items/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::destroy
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:93
 * @route '/logistics/checklist-items/{id}'
 */
    const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\FacilityChecklistController::destroy
 * @see app/Http/Controllers/Logistics/FacilityChecklistController.php:93
 * @route '/logistics/checklist-items/{id}'
 */
        destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const FacilityChecklistController = { index, store, reset, update, destroy }

export default FacilityChecklistController