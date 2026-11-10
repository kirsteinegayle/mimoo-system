import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RiderRegistrationController::create
 * @see app/Http/Controllers/RiderRegistrationController.php:19
 * @route '/register/rider'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/register/rider',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiderRegistrationController::create
 * @see app/Http/Controllers/RiderRegistrationController.php:19
 * @route '/register/rider'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiderRegistrationController::create
 * @see app/Http/Controllers/RiderRegistrationController.php:19
 * @route '/register/rider'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RiderRegistrationController::create
 * @see app/Http/Controllers/RiderRegistrationController.php:19
 * @route '/register/rider'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\RiderRegistrationController::create
 * @see app/Http/Controllers/RiderRegistrationController.php:19
 * @route '/register/rider'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\RiderRegistrationController::create
 * @see app/Http/Controllers/RiderRegistrationController.php:19
 * @route '/register/rider'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\RiderRegistrationController::create
 * @see app/Http/Controllers/RiderRegistrationController.php:19
 * @route '/register/rider'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\RiderRegistrationController::store
 * @see app/Http/Controllers/RiderRegistrationController.php:27
 * @route '/register/rider'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/register/rider',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RiderRegistrationController::store
 * @see app/Http/Controllers/RiderRegistrationController.php:27
 * @route '/register/rider'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiderRegistrationController::store
 * @see app/Http/Controllers/RiderRegistrationController.php:27
 * @route '/register/rider'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\RiderRegistrationController::store
 * @see app/Http/Controllers/RiderRegistrationController.php:27
 * @route '/register/rider'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\RiderRegistrationController::store
 * @see app/Http/Controllers/RiderRegistrationController.php:27
 * @route '/register/rider'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\RiderRegistrationController::pending
 * @see app/Http/Controllers/RiderRegistrationController.php:121
 * @route '/register/rider/pending'
 */
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/register/rider/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RiderRegistrationController::pending
 * @see app/Http/Controllers/RiderRegistrationController.php:121
 * @route '/register/rider/pending'
 */
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RiderRegistrationController::pending
 * @see app/Http/Controllers/RiderRegistrationController.php:121
 * @route '/register/rider/pending'
 */
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RiderRegistrationController::pending
 * @see app/Http/Controllers/RiderRegistrationController.php:121
 * @route '/register/rider/pending'
 */
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\RiderRegistrationController::pending
 * @see app/Http/Controllers/RiderRegistrationController.php:121
 * @route '/register/rider/pending'
 */
    const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pending.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\RiderRegistrationController::pending
 * @see app/Http/Controllers/RiderRegistrationController.php:121
 * @route '/register/rider/pending'
 */
        pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\RiderRegistrationController::pending
 * @see app/Http/Controllers/RiderRegistrationController.php:121
 * @route '/register/rider/pending'
 */
        pendingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pending.form = pendingForm
const RiderRegistrationController = { create, store, pending }

export default RiderRegistrationController