import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierPickupController::index
 * @see app/Http/Controllers/Api/CourierPickupController.php:18
 * @route '/api/courier-app/pickups'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/pickups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::index
 * @see app/Http/Controllers/Api/CourierPickupController.php:18
 * @route '/api/courier-app/pickups'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierPickupController::index
 * @see app/Http/Controllers/Api/CourierPickupController.php:18
 * @route '/api/courier-app/pickups'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierPickupController::index
 * @see app/Http/Controllers/Api/CourierPickupController.php:18
 * @route '/api/courier-app/pickups'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::index
 * @see app/Http/Controllers/Api/CourierPickupController.php:18
 * @route '/api/courier-app/pickups'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::index
 * @see app/Http/Controllers/Api/CourierPickupController.php:18
 * @route '/api/courier-app/pickups'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierPickupController::index
 * @see app/Http/Controllers/Api/CourierPickupController.php:18
 * @route '/api/courier-app/pickups'
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
* @see \App\Http\Controllers\Api\CourierPickupController::show
 * @see app/Http/Controllers/Api/CourierPickupController.php:322
 * @route '/api/courier-app/pickups/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/pickups/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::show
 * @see app/Http/Controllers/Api/CourierPickupController.php:322
 * @route '/api/courier-app/pickups/{id}'
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
* @see \App\Http\Controllers\Api\CourierPickupController::show
 * @see app/Http/Controllers/Api/CourierPickupController.php:322
 * @route '/api/courier-app/pickups/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierPickupController::show
 * @see app/Http/Controllers/Api/CourierPickupController.php:322
 * @route '/api/courier-app/pickups/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::show
 * @see app/Http/Controllers/Api/CourierPickupController.php:322
 * @route '/api/courier-app/pickups/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::show
 * @see app/Http/Controllers/Api/CourierPickupController.php:322
 * @route '/api/courier-app/pickups/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierPickupController::show
 * @see app/Http/Controllers/Api/CourierPickupController.php:322
 * @route '/api/courier-app/pickups/{id}'
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
* @see \App\Http\Controllers\Api\CourierPickupController::schedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:170
 * @route '/api/courier-app/pickups/{id}/schedule'
 */
export const schedule = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: schedule.url(args, options),
    method: 'post',
})

schedule.definition = {
    methods: ["post"],
    url: '/api/courier-app/pickups/{id}/schedule',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::schedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:170
 * @route '/api/courier-app/pickups/{id}/schedule'
 */
schedule.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return schedule.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierPickupController::schedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:170
 * @route '/api/courier-app/pickups/{id}/schedule'
 */
schedule.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: schedule.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::schedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:170
 * @route '/api/courier-app/pickups/{id}/schedule'
 */
    const scheduleForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: schedule.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::schedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:170
 * @route '/api/courier-app/pickups/{id}/schedule'
 */
        scheduleForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: schedule.url(args, options),
            method: 'post',
        })
    
    schedule.form = scheduleForm
/**
* @see \App\Http\Controllers\Api\CourierPickupController::assignPersonnel
 * @see app/Http/Controllers/Api/CourierPickupController.php:201
 * @route '/api/courier-app/pickups/{id}/assign-personnel'
 */
export const assignPersonnel = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignPersonnel.url(args, options),
    method: 'post',
})

assignPersonnel.definition = {
    methods: ["post"],
    url: '/api/courier-app/pickups/{id}/assign-personnel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::assignPersonnel
 * @see app/Http/Controllers/Api/CourierPickupController.php:201
 * @route '/api/courier-app/pickups/{id}/assign-personnel'
 */
assignPersonnel.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return assignPersonnel.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierPickupController::assignPersonnel
 * @see app/Http/Controllers/Api/CourierPickupController.php:201
 * @route '/api/courier-app/pickups/{id}/assign-personnel'
 */
assignPersonnel.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignPersonnel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::assignPersonnel
 * @see app/Http/Controllers/Api/CourierPickupController.php:201
 * @route '/api/courier-app/pickups/{id}/assign-personnel'
 */
    const assignPersonnelForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignPersonnel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::assignPersonnel
 * @see app/Http/Controllers/Api/CourierPickupController.php:201
 * @route '/api/courier-app/pickups/{id}/assign-personnel'
 */
        assignPersonnelForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignPersonnel.url(args, options),
            method: 'post',
        })
    
    assignPersonnel.form = assignPersonnelForm
/**
* @see \App\Http\Controllers\Api\CourierPickupController::confirm
 * @see app/Http/Controllers/Api/CourierPickupController.php:238
 * @route '/api/courier-app/pickups/{id}/confirm'
 */
export const confirm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(args, options),
    method: 'post',
})

confirm.definition = {
    methods: ["post"],
    url: '/api/courier-app/pickups/{id}/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::confirm
 * @see app/Http/Controllers/Api/CourierPickupController.php:238
 * @route '/api/courier-app/pickups/{id}/confirm'
 */
confirm.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return confirm.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierPickupController::confirm
 * @see app/Http/Controllers/Api/CourierPickupController.php:238
 * @route '/api/courier-app/pickups/{id}/confirm'
 */
confirm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::confirm
 * @see app/Http/Controllers/Api/CourierPickupController.php:238
 * @route '/api/courier-app/pickups/{id}/confirm'
 */
    const confirmForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: confirm.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::confirm
 * @see app/Http/Controllers/Api/CourierPickupController.php:238
 * @route '/api/courier-app/pickups/{id}/confirm'
 */
        confirmForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: confirm.url(args, options),
            method: 'post',
        })
    
    confirm.form = confirmForm
/**
* @see \App\Http\Controllers\Api\CourierPickupController::recordFailed
 * @see app/Http/Controllers/Api/CourierPickupController.php:279
 * @route '/api/courier-app/pickups/{id}/record-failed'
 */
export const recordFailed = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recordFailed.url(args, options),
    method: 'post',
})

recordFailed.definition = {
    methods: ["post"],
    url: '/api/courier-app/pickups/{id}/record-failed',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::recordFailed
 * @see app/Http/Controllers/Api/CourierPickupController.php:279
 * @route '/api/courier-app/pickups/{id}/record-failed'
 */
recordFailed.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return recordFailed.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierPickupController::recordFailed
 * @see app/Http/Controllers/Api/CourierPickupController.php:279
 * @route '/api/courier-app/pickups/{id}/record-failed'
 */
recordFailed.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recordFailed.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::recordFailed
 * @see app/Http/Controllers/Api/CourierPickupController.php:279
 * @route '/api/courier-app/pickups/{id}/record-failed'
 */
    const recordFailedForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: recordFailed.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::recordFailed
 * @see app/Http/Controllers/Api/CourierPickupController.php:279
 * @route '/api/courier-app/pickups/{id}/record-failed'
 */
        recordFailedForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: recordFailed.url(args, options),
            method: 'post',
        })
    
    recordFailed.form = recordFailedForm
/**
* @see \App\Http\Controllers\Api\CourierPickupController::reschedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:398
 * @route '/api/courier-app/pickups/{id}/reschedule'
 */
export const reschedule = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reschedule.url(args, options),
    method: 'post',
})

reschedule.definition = {
    methods: ["post"],
    url: '/api/courier-app/pickups/{id}/reschedule',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::reschedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:398
 * @route '/api/courier-app/pickups/{id}/reschedule'
 */
reschedule.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reschedule.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierPickupController::reschedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:398
 * @route '/api/courier-app/pickups/{id}/reschedule'
 */
reschedule.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reschedule.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::reschedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:398
 * @route '/api/courier-app/pickups/{id}/reschedule'
 */
    const rescheduleForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reschedule.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::reschedule
 * @see app/Http/Controllers/Api/CourierPickupController.php:398
 * @route '/api/courier-app/pickups/{id}/reschedule'
 */
        rescheduleForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reschedule.url(args, options),
            method: 'post',
        })
    
    reschedule.form = rescheduleForm
/**
* @see \App\Http\Controllers\Api\CourierPickupController::cancel
 * @see app/Http/Controllers/Api/CourierPickupController.php:440
 * @route '/api/courier-app/pickups/{id}/cancel'
 */
export const cancel = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/api/courier-app/pickups/{id}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierPickupController::cancel
 * @see app/Http/Controllers/Api/CourierPickupController.php:440
 * @route '/api/courier-app/pickups/{id}/cancel'
 */
cancel.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return cancel.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierPickupController::cancel
 * @see app/Http/Controllers/Api/CourierPickupController.php:440
 * @route '/api/courier-app/pickups/{id}/cancel'
 */
cancel.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierPickupController::cancel
 * @see app/Http/Controllers/Api/CourierPickupController.php:440
 * @route '/api/courier-app/pickups/{id}/cancel'
 */
    const cancelForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierPickupController::cancel
 * @see app/Http/Controllers/Api/CourierPickupController.php:440
 * @route '/api/courier-app/pickups/{id}/cancel'
 */
        cancelForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
const CourierPickupController = { index, show, schedule, assignPersonnel, confirm, recordFailed, reschedule, cancel }

export default CourierPickupController