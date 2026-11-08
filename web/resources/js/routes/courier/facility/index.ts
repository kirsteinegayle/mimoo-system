import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\FacilityController::store
 * @see app/Http/Controllers/Courier/FacilityController.php:64
 * @route '/courier/branch-facility'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/courier/branch-facility',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\FacilityController::store
 * @see app/Http/Controllers/Courier/FacilityController.php:64
 * @route '/courier/branch-facility'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\FacilityController::store
 * @see app/Http/Controllers/Courier/FacilityController.php:64
 * @route '/courier/branch-facility'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\FacilityController::store
 * @see app/Http/Controllers/Courier/FacilityController.php:64
 * @route '/courier/branch-facility'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\FacilityController::store
 * @see app/Http/Controllers/Courier/FacilityController.php:64
 * @route '/courier/branch-facility'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Courier\FacilityController::generate
 * @see app/Http/Controllers/Courier/FacilityController.php:214
 * @route '/courier/branch-facility/generate'
 */
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/courier/branch-facility/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\FacilityController::generate
 * @see app/Http/Controllers/Courier/FacilityController.php:214
 * @route '/courier/branch-facility/generate'
 */
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\FacilityController::generate
 * @see app/Http/Controllers/Courier/FacilityController.php:214
 * @route '/courier/branch-facility/generate'
 */
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\FacilityController::generate
 * @see app/Http/Controllers/Courier/FacilityController.php:214
 * @route '/courier/branch-facility/generate'
 */
    const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: generate.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\FacilityController::generate
 * @see app/Http/Controllers/Courier/FacilityController.php:214
 * @route '/courier/branch-facility/generate'
 */
        generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: generate.url(options),
            method: 'post',
        })
    
    generate.form = generateForm
/**
* @see \App\Http\Controllers\Courier\FacilityController::update
 * @see app/Http/Controllers/Courier/FacilityController.php:130
 * @route '/courier/branch-facility/{facility}'
 */
export const update = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/courier/branch-facility/{facility}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Courier\FacilityController::update
 * @see app/Http/Controllers/Courier/FacilityController.php:130
 * @route '/courier/branch-facility/{facility}'
 */
update.url = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { facility: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { facility: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    facility: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        facility: typeof args.facility === 'object'
                ? args.facility.id
                : args.facility,
                }

    return update.definition.url
            .replace('{facility}', parsedArgs.facility.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\FacilityController::update
 * @see app/Http/Controllers/Courier/FacilityController.php:130
 * @route '/courier/branch-facility/{facility}'
 */
update.put = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Courier\FacilityController::update
 * @see app/Http/Controllers/Courier/FacilityController.php:130
 * @route '/courier/branch-facility/{facility}'
 */
    const updateForm = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\FacilityController::update
 * @see app/Http/Controllers/Courier/FacilityController.php:130
 * @route '/courier/branch-facility/{facility}'
 */
        updateForm.put = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Courier\FacilityController::destroy
 * @see app/Http/Controllers/Courier/FacilityController.php:190
 * @route '/courier/branch-facility/{facility}'
 */
export const destroy = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/courier/branch-facility/{facility}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Courier\FacilityController::destroy
 * @see app/Http/Controllers/Courier/FacilityController.php:190
 * @route '/courier/branch-facility/{facility}'
 */
destroy.url = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { facility: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { facility: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    facility: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        facility: typeof args.facility === 'object'
                ? args.facility.id
                : args.facility,
                }

    return destroy.definition.url
            .replace('{facility}', parsedArgs.facility.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\FacilityController::destroy
 * @see app/Http/Controllers/Courier/FacilityController.php:190
 * @route '/courier/branch-facility/{facility}'
 */
destroy.delete = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Courier\FacilityController::destroy
 * @see app/Http/Controllers/Courier/FacilityController.php:190
 * @route '/courier/branch-facility/{facility}'
 */
    const destroyForm = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\FacilityController::destroy
 * @see app/Http/Controllers/Courier/FacilityController.php:190
 * @route '/courier/branch-facility/{facility}'
 */
        destroyForm.delete = (args: { facility: number | { id: number } } | [facility: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const facility = {
    store: Object.assign(store, store),
generate: Object.assign(generate, generate),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default facility