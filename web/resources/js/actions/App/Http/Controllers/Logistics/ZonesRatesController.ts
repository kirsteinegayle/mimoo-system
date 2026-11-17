import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::data
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:37
 * @route '/logistics/zones-data'
 */
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/logistics/zones-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::data
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:37
 * @route '/logistics/zones-data'
 */
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::data
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:37
 * @route '/logistics/zones-data'
 */
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::data
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:37
 * @route '/logistics/zones-data'
 */
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::data
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:37
 * @route '/logistics/zones-data'
 */
    const dataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: data.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::data
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:37
 * @route '/logistics/zones-data'
 */
        dataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::data
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:37
 * @route '/logistics/zones-data'
 */
        dataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    data.form = dataForm
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:64
 * @route '/logistics/zones'
 */
export const storeZone = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeZone.url(options),
    method: 'post',
})

storeZone.definition = {
    methods: ["post"],
    url: '/logistics/zones',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:64
 * @route '/logistics/zones'
 */
storeZone.url = (options?: RouteQueryOptions) => {
    return storeZone.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:64
 * @route '/logistics/zones'
 */
storeZone.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeZone.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:64
 * @route '/logistics/zones'
 */
    const storeZoneForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeZone.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:64
 * @route '/logistics/zones'
 */
        storeZoneForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeZone.url(options),
            method: 'post',
        })
    
    storeZone.form = storeZoneForm
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:80
 * @route '/logistics/zones/{id}'
 */
export const updateZone = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateZone.url(args, options),
    method: 'put',
})

updateZone.definition = {
    methods: ["put"],
    url: '/logistics/zones/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:80
 * @route '/logistics/zones/{id}'
 */
updateZone.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateZone.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:80
 * @route '/logistics/zones/{id}'
 */
updateZone.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateZone.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:80
 * @route '/logistics/zones/{id}'
 */
    const updateZoneForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateZone.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:80
 * @route '/logistics/zones/{id}'
 */
        updateZoneForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateZone.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateZone.form = updateZoneForm
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:95
 * @route '/logistics/zones/{id}'
 */
export const destroyZone = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyZone.url(args, options),
    method: 'delete',
})

destroyZone.definition = {
    methods: ["delete"],
    url: '/logistics/zones/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:95
 * @route '/logistics/zones/{id}'
 */
destroyZone.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroyZone.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:95
 * @route '/logistics/zones/{id}'
 */
destroyZone.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyZone.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:95
 * @route '/logistics/zones/{id}'
 */
    const destroyZoneForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyZone.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyZone
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:95
 * @route '/logistics/zones/{id}'
 */
        destroyZoneForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyZone.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyZone.form = destroyZoneForm
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:132
 * @route '/logistics/zones/{id}/rates'
 */
export const storeRate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRate.url(args, options),
    method: 'post',
})

storeRate.definition = {
    methods: ["post"],
    url: '/logistics/zones/{id}/rates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:132
 * @route '/logistics/zones/{id}/rates'
 */
storeRate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return storeRate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:132
 * @route '/logistics/zones/{id}/rates'
 */
storeRate.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:132
 * @route '/logistics/zones/{id}/rates'
 */
    const storeRateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeRate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::storeRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:132
 * @route '/logistics/zones/{id}/rates'
 */
        storeRateForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeRate.url(args, options),
            method: 'post',
        })
    
    storeRate.form = storeRateForm
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:151
 * @route '/logistics/rates/{id}'
 */
export const updateRate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRate.url(args, options),
    method: 'put',
})

updateRate.definition = {
    methods: ["put"],
    url: '/logistics/rates/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:151
 * @route '/logistics/rates/{id}'
 */
updateRate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateRate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:151
 * @route '/logistics/rates/{id}'
 */
updateRate.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRate.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:151
 * @route '/logistics/rates/{id}'
 */
    const updateRateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateRate.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::updateRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:151
 * @route '/logistics/rates/{id}'
 */
        updateRateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateRate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateRate.form = updateRateForm
/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:171
 * @route '/logistics/rates/{id}'
 */
export const destroyRate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyRate.url(args, options),
    method: 'delete',
})

destroyRate.definition = {
    methods: ["delete"],
    url: '/logistics/rates/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:171
 * @route '/logistics/rates/{id}'
 */
destroyRate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroyRate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:171
 * @route '/logistics/rates/{id}'
 */
destroyRate.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyRate.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:171
 * @route '/logistics/rates/{id}'
 */
    const destroyRateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyRate.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\ZonesRatesController::destroyRate
 * @see app/Http/Controllers/Logistics/ZonesRatesController.php:171
 * @route '/logistics/rates/{id}'
 */
        destroyRateForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyRate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyRate.form = destroyRateForm
const ZonesRatesController = { data, storeZone, updateZone, destroyZone, storeRate, updateRate, destroyRate }

export default ZonesRatesController