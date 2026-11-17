import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/buyer/support/tickets'
 */
const indexb8def5ca2dba3861e1a24520ca9884ca = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexb8def5ca2dba3861e1a24520ca9884ca.url(options),
    method: 'get',
})

indexb8def5ca2dba3861e1a24520ca9884ca.definition = {
    methods: ["get","head"],
    url: '/api/buyer/support/tickets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/buyer/support/tickets'
 */
indexb8def5ca2dba3861e1a24520ca9884ca.url = (options?: RouteQueryOptions) => {
    return indexb8def5ca2dba3861e1a24520ca9884ca.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/buyer/support/tickets'
 */
indexb8def5ca2dba3861e1a24520ca9884ca.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexb8def5ca2dba3861e1a24520ca9884ca.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/buyer/support/tickets'
 */
indexb8def5ca2dba3861e1a24520ca9884ca.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexb8def5ca2dba3861e1a24520ca9884ca.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/buyer/support/tickets'
 */
    const indexb8def5ca2dba3861e1a24520ca9884caForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexb8def5ca2dba3861e1a24520ca9884ca.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/buyer/support/tickets'
 */
        indexb8def5ca2dba3861e1a24520ca9884caForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexb8def5ca2dba3861e1a24520ca9884ca.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/buyer/support/tickets'
 */
        indexb8def5ca2dba3861e1a24520ca9884caForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexb8def5ca2dba3861e1a24520ca9884ca.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexb8def5ca2dba3861e1a24520ca9884ca.form = indexb8def5ca2dba3861e1a24520ca9884caForm
    /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/courier-app/support/tickets'
 */
const indexb168f287a51097f08d12b5fdf8ffe3d5 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexb168f287a51097f08d12b5fdf8ffe3d5.url(options),
    method: 'get',
})

indexb168f287a51097f08d12b5fdf8ffe3d5.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/support/tickets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/courier-app/support/tickets'
 */
indexb168f287a51097f08d12b5fdf8ffe3d5.url = (options?: RouteQueryOptions) => {
    return indexb168f287a51097f08d12b5fdf8ffe3d5.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/courier-app/support/tickets'
 */
indexb168f287a51097f08d12b5fdf8ffe3d5.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexb168f287a51097f08d12b5fdf8ffe3d5.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/courier-app/support/tickets'
 */
indexb168f287a51097f08d12b5fdf8ffe3d5.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexb168f287a51097f08d12b5fdf8ffe3d5.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/courier-app/support/tickets'
 */
    const indexb168f287a51097f08d12b5fdf8ffe3d5Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexb168f287a51097f08d12b5fdf8ffe3d5.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/courier-app/support/tickets'
 */
        indexb168f287a51097f08d12b5fdf8ffe3d5Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexb168f287a51097f08d12b5fdf8ffe3d5.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/courier-app/support/tickets'
 */
        indexb168f287a51097f08d12b5fdf8ffe3d5Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexb168f287a51097f08d12b5fdf8ffe3d5.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexb168f287a51097f08d12b5fdf8ffe3d5.form = indexb168f287a51097f08d12b5fdf8ffe3d5Form
    /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/rider-app/support/tickets'
 */
const index7a1eb5565c8c2d181b91a4bcb256f40c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
    method: 'get',
})

index7a1eb5565c8c2d181b91a4bcb256f40c.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/support/tickets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/rider-app/support/tickets'
 */
index7a1eb5565c8c2d181b91a4bcb256f40c.url = (options?: RouteQueryOptions) => {
    return index7a1eb5565c8c2d181b91a4bcb256f40c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/rider-app/support/tickets'
 */
index7a1eb5565c8c2d181b91a4bcb256f40c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/rider-app/support/tickets'
 */
index7a1eb5565c8c2d181b91a4bcb256f40c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/rider-app/support/tickets'
 */
    const index7a1eb5565c8c2d181b91a4bcb256f40cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/rider-app/support/tickets'
 */
        index7a1eb5565c8c2d181b91a4bcb256f40cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/api/rider-app/support/tickets'
 */
        index7a1eb5565c8c2d181b91a4bcb256f40cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index7a1eb5565c8c2d181b91a4bcb256f40c.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index7a1eb5565c8c2d181b91a4bcb256f40c.form = index7a1eb5565c8c2d181b91a4bcb256f40cForm
    /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/support/tickets'
 */
const indexdd51ec4f9680b1f6de0ee10ea1bdcbd2 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
    method: 'get',
})

indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.definition = {
    methods: ["get","head"],
    url: '/support/tickets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/support/tickets'
 */
indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.url = (options?: RouteQueryOptions) => {
    return indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/support/tickets'
 */
indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/support/tickets'
 */
indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/support/tickets'
 */
    const indexdd51ec4f9680b1f6de0ee10ea1bdcbd2Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/support/tickets'
 */
        indexdd51ec4f9680b1f6de0ee10ea1bdcbd2Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::index
 * @see app/Http/Controllers/SupportTicketController.php:36
 * @route '/support/tickets'
 */
        indexdd51ec4f9680b1f6de0ee10ea1bdcbd2Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexdd51ec4f9680b1f6de0ee10ea1bdcbd2.form = indexdd51ec4f9680b1f6de0ee10ea1bdcbd2Form

/**
* Multiple routes resolve to \App\Http\Controllers\SupportTicketController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/support/tickets': indexb8def5ca2dba3861e1a24520ca9884ca,
    '/api/courier-app/support/tickets': indexb168f287a51097f08d12b5fdf8ffe3d5,
    '/api/rider-app/support/tickets': index7a1eb5565c8c2d181b91a4bcb256f40c,
    '/support/tickets': indexdd51ec4f9680b1f6de0ee10ea1bdcbd2,
}

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/buyer/support/tickets'
 */
const storeb8def5ca2dba3861e1a24520ca9884ca = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeb8def5ca2dba3861e1a24520ca9884ca.url(options),
    method: 'post',
})

storeb8def5ca2dba3861e1a24520ca9884ca.definition = {
    methods: ["post"],
    url: '/api/buyer/support/tickets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/buyer/support/tickets'
 */
storeb8def5ca2dba3861e1a24520ca9884ca.url = (options?: RouteQueryOptions) => {
    return storeb8def5ca2dba3861e1a24520ca9884ca.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/buyer/support/tickets'
 */
storeb8def5ca2dba3861e1a24520ca9884ca.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeb8def5ca2dba3861e1a24520ca9884ca.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/buyer/support/tickets'
 */
    const storeb8def5ca2dba3861e1a24520ca9884caForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeb8def5ca2dba3861e1a24520ca9884ca.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/buyer/support/tickets'
 */
        storeb8def5ca2dba3861e1a24520ca9884caForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeb8def5ca2dba3861e1a24520ca9884ca.url(options),
            method: 'post',
        })
    
    storeb8def5ca2dba3861e1a24520ca9884ca.form = storeb8def5ca2dba3861e1a24520ca9884caForm
    /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/courier-app/support/tickets'
 */
const storeb168f287a51097f08d12b5fdf8ffe3d5 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeb168f287a51097f08d12b5fdf8ffe3d5.url(options),
    method: 'post',
})

storeb168f287a51097f08d12b5fdf8ffe3d5.definition = {
    methods: ["post"],
    url: '/api/courier-app/support/tickets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/courier-app/support/tickets'
 */
storeb168f287a51097f08d12b5fdf8ffe3d5.url = (options?: RouteQueryOptions) => {
    return storeb168f287a51097f08d12b5fdf8ffe3d5.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/courier-app/support/tickets'
 */
storeb168f287a51097f08d12b5fdf8ffe3d5.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeb168f287a51097f08d12b5fdf8ffe3d5.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/courier-app/support/tickets'
 */
    const storeb168f287a51097f08d12b5fdf8ffe3d5Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeb168f287a51097f08d12b5fdf8ffe3d5.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/courier-app/support/tickets'
 */
        storeb168f287a51097f08d12b5fdf8ffe3d5Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeb168f287a51097f08d12b5fdf8ffe3d5.url(options),
            method: 'post',
        })
    
    storeb168f287a51097f08d12b5fdf8ffe3d5.form = storeb168f287a51097f08d12b5fdf8ffe3d5Form
    /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/rider-app/support/tickets'
 */
const store7a1eb5565c8c2d181b91a4bcb256f40c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
    method: 'post',
})

store7a1eb5565c8c2d181b91a4bcb256f40c.definition = {
    methods: ["post"],
    url: '/api/rider-app/support/tickets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/rider-app/support/tickets'
 */
store7a1eb5565c8c2d181b91a4bcb256f40c.url = (options?: RouteQueryOptions) => {
    return store7a1eb5565c8c2d181b91a4bcb256f40c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/rider-app/support/tickets'
 */
store7a1eb5565c8c2d181b91a4bcb256f40c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/rider-app/support/tickets'
 */
    const store7a1eb5565c8c2d181b91a4bcb256f40cForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/api/rider-app/support/tickets'
 */
        store7a1eb5565c8c2d181b91a4bcb256f40cForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store7a1eb5565c8c2d181b91a4bcb256f40c.url(options),
            method: 'post',
        })
    
    store7a1eb5565c8c2d181b91a4bcb256f40c.form = store7a1eb5565c8c2d181b91a4bcb256f40cForm
    /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/support/tickets'
 */
const storedd51ec4f9680b1f6de0ee10ea1bdcbd2 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storedd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
    method: 'post',
})

storedd51ec4f9680b1f6de0ee10ea1bdcbd2.definition = {
    methods: ["post"],
    url: '/support/tickets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/support/tickets'
 */
storedd51ec4f9680b1f6de0ee10ea1bdcbd2.url = (options?: RouteQueryOptions) => {
    return storedd51ec4f9680b1f6de0ee10ea1bdcbd2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/support/tickets'
 */
storedd51ec4f9680b1f6de0ee10ea1bdcbd2.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storedd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/support/tickets'
 */
    const storedd51ec4f9680b1f6de0ee10ea1bdcbd2Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storedd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::store
 * @see app/Http/Controllers/SupportTicketController.php:47
 * @route '/support/tickets'
 */
        storedd51ec4f9680b1f6de0ee10ea1bdcbd2Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storedd51ec4f9680b1f6de0ee10ea1bdcbd2.url(options),
            method: 'post',
        })
    
    storedd51ec4f9680b1f6de0ee10ea1bdcbd2.form = storedd51ec4f9680b1f6de0ee10ea1bdcbd2Form

/**
* Multiple routes resolve to \App\Http\Controllers\SupportTicketController::store, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `store['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const store = {
    '/api/buyer/support/tickets': storeb8def5ca2dba3861e1a24520ca9884ca,
    '/api/courier-app/support/tickets': storeb168f287a51097f08d12b5fdf8ffe3d5,
    '/api/rider-app/support/tickets': store7a1eb5565c8c2d181b91a4bcb256f40c,
    '/support/tickets': storedd51ec4f9680b1f6de0ee10ea1bdcbd2,
}

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/buyer/support/tickets/{id}'
 */
const show5f8dc6ed6b3e0f0756e27411d22cb33d = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show5f8dc6ed6b3e0f0756e27411d22cb33d.url(args, options),
    method: 'get',
})

show5f8dc6ed6b3e0f0756e27411d22cb33d.definition = {
    methods: ["get","head"],
    url: '/api/buyer/support/tickets/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/buyer/support/tickets/{id}'
 */
show5f8dc6ed6b3e0f0756e27411d22cb33d.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show5f8dc6ed6b3e0f0756e27411d22cb33d.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/buyer/support/tickets/{id}'
 */
show5f8dc6ed6b3e0f0756e27411d22cb33d.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show5f8dc6ed6b3e0f0756e27411d22cb33d.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/buyer/support/tickets/{id}'
 */
show5f8dc6ed6b3e0f0756e27411d22cb33d.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show5f8dc6ed6b3e0f0756e27411d22cb33d.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/buyer/support/tickets/{id}'
 */
    const show5f8dc6ed6b3e0f0756e27411d22cb33dForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show5f8dc6ed6b3e0f0756e27411d22cb33d.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/buyer/support/tickets/{id}'
 */
        show5f8dc6ed6b3e0f0756e27411d22cb33dForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show5f8dc6ed6b3e0f0756e27411d22cb33d.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/buyer/support/tickets/{id}'
 */
        show5f8dc6ed6b3e0f0756e27411d22cb33dForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show5f8dc6ed6b3e0f0756e27411d22cb33d.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show5f8dc6ed6b3e0f0756e27411d22cb33d.form = show5f8dc6ed6b3e0f0756e27411d22cb33dForm
    /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/courier-app/support/tickets/{id}'
 */
const show891da513efc0a9faf4a9d8e9c19f1f92 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show891da513efc0a9faf4a9d8e9c19f1f92.url(args, options),
    method: 'get',
})

show891da513efc0a9faf4a9d8e9c19f1f92.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/support/tickets/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/courier-app/support/tickets/{id}'
 */
show891da513efc0a9faf4a9d8e9c19f1f92.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show891da513efc0a9faf4a9d8e9c19f1f92.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/courier-app/support/tickets/{id}'
 */
show891da513efc0a9faf4a9d8e9c19f1f92.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show891da513efc0a9faf4a9d8e9c19f1f92.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/courier-app/support/tickets/{id}'
 */
show891da513efc0a9faf4a9d8e9c19f1f92.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show891da513efc0a9faf4a9d8e9c19f1f92.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/courier-app/support/tickets/{id}'
 */
    const show891da513efc0a9faf4a9d8e9c19f1f92Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show891da513efc0a9faf4a9d8e9c19f1f92.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/courier-app/support/tickets/{id}'
 */
        show891da513efc0a9faf4a9d8e9c19f1f92Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show891da513efc0a9faf4a9d8e9c19f1f92.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/courier-app/support/tickets/{id}'
 */
        show891da513efc0a9faf4a9d8e9c19f1f92Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show891da513efc0a9faf4a9d8e9c19f1f92.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show891da513efc0a9faf4a9d8e9c19f1f92.form = show891da513efc0a9faf4a9d8e9c19f1f92Form
    /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/rider-app/support/tickets/{id}'
 */
const show43abc00de3cc8672aabd44b600812e06 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show43abc00de3cc8672aabd44b600812e06.url(args, options),
    method: 'get',
})

show43abc00de3cc8672aabd44b600812e06.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/support/tickets/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/rider-app/support/tickets/{id}'
 */
show43abc00de3cc8672aabd44b600812e06.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show43abc00de3cc8672aabd44b600812e06.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/rider-app/support/tickets/{id}'
 */
show43abc00de3cc8672aabd44b600812e06.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show43abc00de3cc8672aabd44b600812e06.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/rider-app/support/tickets/{id}'
 */
show43abc00de3cc8672aabd44b600812e06.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show43abc00de3cc8672aabd44b600812e06.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/rider-app/support/tickets/{id}'
 */
    const show43abc00de3cc8672aabd44b600812e06Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show43abc00de3cc8672aabd44b600812e06.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/rider-app/support/tickets/{id}'
 */
        show43abc00de3cc8672aabd44b600812e06Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show43abc00de3cc8672aabd44b600812e06.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/api/rider-app/support/tickets/{id}'
 */
        show43abc00de3cc8672aabd44b600812e06Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show43abc00de3cc8672aabd44b600812e06.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show43abc00de3cc8672aabd44b600812e06.form = show43abc00de3cc8672aabd44b600812e06Form
    /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/support/tickets/{id}'
 */
const showb13ae64c1566bc100c64cad9477eb22a = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showb13ae64c1566bc100c64cad9477eb22a.url(args, options),
    method: 'get',
})

showb13ae64c1566bc100c64cad9477eb22a.definition = {
    methods: ["get","head"],
    url: '/support/tickets/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/support/tickets/{id}'
 */
showb13ae64c1566bc100c64cad9477eb22a.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showb13ae64c1566bc100c64cad9477eb22a.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/support/tickets/{id}'
 */
showb13ae64c1566bc100c64cad9477eb22a.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showb13ae64c1566bc100c64cad9477eb22a.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/support/tickets/{id}'
 */
showb13ae64c1566bc100c64cad9477eb22a.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showb13ae64c1566bc100c64cad9477eb22a.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/support/tickets/{id}'
 */
    const showb13ae64c1566bc100c64cad9477eb22aForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showb13ae64c1566bc100c64cad9477eb22a.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/support/tickets/{id}'
 */
        showb13ae64c1566bc100c64cad9477eb22aForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showb13ae64c1566bc100c64cad9477eb22a.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::show
 * @see app/Http/Controllers/SupportTicketController.php:74
 * @route '/support/tickets/{id}'
 */
        showb13ae64c1566bc100c64cad9477eb22aForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showb13ae64c1566bc100c64cad9477eb22a.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showb13ae64c1566bc100c64cad9477eb22a.form = showb13ae64c1566bc100c64cad9477eb22aForm

/**
* Multiple routes resolve to \App\Http\Controllers\SupportTicketController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/buyer/support/tickets/{id}': show5f8dc6ed6b3e0f0756e27411d22cb33d,
    '/api/courier-app/support/tickets/{id}': show891da513efc0a9faf4a9d8e9c19f1f92,
    '/api/rider-app/support/tickets/{id}': show43abc00de3cc8672aabd44b600812e06,
    '/support/tickets/{id}': showb13ae64c1566bc100c64cad9477eb22a,
}

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/buyer/support/tickets/{id}/replies'
 */
const reply143bdfbcd73a570bd83cbd3c6ca67f94 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply143bdfbcd73a570bd83cbd3c6ca67f94.url(args, options),
    method: 'post',
})

reply143bdfbcd73a570bd83cbd3c6ca67f94.definition = {
    methods: ["post"],
    url: '/api/buyer/support/tickets/{id}/replies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/buyer/support/tickets/{id}/replies'
 */
reply143bdfbcd73a570bd83cbd3c6ca67f94.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reply143bdfbcd73a570bd83cbd3c6ca67f94.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/buyer/support/tickets/{id}/replies'
 */
reply143bdfbcd73a570bd83cbd3c6ca67f94.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply143bdfbcd73a570bd83cbd3c6ca67f94.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/buyer/support/tickets/{id}/replies'
 */
    const reply143bdfbcd73a570bd83cbd3c6ca67f94Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reply143bdfbcd73a570bd83cbd3c6ca67f94.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/buyer/support/tickets/{id}/replies'
 */
        reply143bdfbcd73a570bd83cbd3c6ca67f94Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reply143bdfbcd73a570bd83cbd3c6ca67f94.url(args, options),
            method: 'post',
        })
    
    reply143bdfbcd73a570bd83cbd3c6ca67f94.form = reply143bdfbcd73a570bd83cbd3c6ca67f94Form
    /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/courier-app/support/tickets/{id}/replies'
 */
const replye48a333a9ace776370b440656bd87925 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replye48a333a9ace776370b440656bd87925.url(args, options),
    method: 'post',
})

replye48a333a9ace776370b440656bd87925.definition = {
    methods: ["post"],
    url: '/api/courier-app/support/tickets/{id}/replies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/courier-app/support/tickets/{id}/replies'
 */
replye48a333a9ace776370b440656bd87925.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return replye48a333a9ace776370b440656bd87925.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/courier-app/support/tickets/{id}/replies'
 */
replye48a333a9ace776370b440656bd87925.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replye48a333a9ace776370b440656bd87925.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/courier-app/support/tickets/{id}/replies'
 */
    const replye48a333a9ace776370b440656bd87925Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: replye48a333a9ace776370b440656bd87925.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/courier-app/support/tickets/{id}/replies'
 */
        replye48a333a9ace776370b440656bd87925Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: replye48a333a9ace776370b440656bd87925.url(args, options),
            method: 'post',
        })
    
    replye48a333a9ace776370b440656bd87925.form = replye48a333a9ace776370b440656bd87925Form
    /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/rider-app/support/tickets/{id}/replies'
 */
const replye63b4a793c705aa95d25458202f50db4 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replye63b4a793c705aa95d25458202f50db4.url(args, options),
    method: 'post',
})

replye63b4a793c705aa95d25458202f50db4.definition = {
    methods: ["post"],
    url: '/api/rider-app/support/tickets/{id}/replies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/rider-app/support/tickets/{id}/replies'
 */
replye63b4a793c705aa95d25458202f50db4.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return replye63b4a793c705aa95d25458202f50db4.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/rider-app/support/tickets/{id}/replies'
 */
replye63b4a793c705aa95d25458202f50db4.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replye63b4a793c705aa95d25458202f50db4.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/rider-app/support/tickets/{id}/replies'
 */
    const replye63b4a793c705aa95d25458202f50db4Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: replye63b4a793c705aa95d25458202f50db4.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/api/rider-app/support/tickets/{id}/replies'
 */
        replye63b4a793c705aa95d25458202f50db4Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: replye63b4a793c705aa95d25458202f50db4.url(args, options),
            method: 'post',
        })
    
    replye63b4a793c705aa95d25458202f50db4.form = replye63b4a793c705aa95d25458202f50db4Form
    /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/support/tickets/{id}/replies'
 */
const replyf4efaa86fcc1593d7ec22f8c1537bb62 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replyf4efaa86fcc1593d7ec22f8c1537bb62.url(args, options),
    method: 'post',
})

replyf4efaa86fcc1593d7ec22f8c1537bb62.definition = {
    methods: ["post"],
    url: '/support/tickets/{id}/replies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/support/tickets/{id}/replies'
 */
replyf4efaa86fcc1593d7ec22f8c1537bb62.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return replyf4efaa86fcc1593d7ec22f8c1537bb62.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/support/tickets/{id}/replies'
 */
replyf4efaa86fcc1593d7ec22f8c1537bb62.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replyf4efaa86fcc1593d7ec22f8c1537bb62.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/support/tickets/{id}/replies'
 */
    const replyf4efaa86fcc1593d7ec22f8c1537bb62Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: replyf4efaa86fcc1593d7ec22f8c1537bb62.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::reply
 * @see app/Http/Controllers/SupportTicketController.php:87
 * @route '/support/tickets/{id}/replies'
 */
        replyf4efaa86fcc1593d7ec22f8c1537bb62Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: replyf4efaa86fcc1593d7ec22f8c1537bb62.url(args, options),
            method: 'post',
        })
    
    replyf4efaa86fcc1593d7ec22f8c1537bb62.form = replyf4efaa86fcc1593d7ec22f8c1537bb62Form

/**
* Multiple routes resolve to \App\Http\Controllers\SupportTicketController::reply, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `reply['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const reply = {
    '/api/buyer/support/tickets/{id}/replies': reply143bdfbcd73a570bd83cbd3c6ca67f94,
    '/api/courier-app/support/tickets/{id}/replies': replye48a333a9ace776370b440656bd87925,
    '/api/rider-app/support/tickets/{id}/replies': replye63b4a793c705aa95d25458202f50db4,
    '/support/tickets/{id}/replies': replyf4efaa86fcc1593d7ec22f8c1537bb62,
}

/**
* @see \App\Http\Controllers\SupportTicketController::buyerPage
 * @see app/Http/Controllers/SupportTicketController.php:26
 * @route '/support'
 */
export const buyerPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerPage.url(options),
    method: 'get',
})

buyerPage.definition = {
    methods: ["get","head"],
    url: '/support',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::buyerPage
 * @see app/Http/Controllers/SupportTicketController.php:26
 * @route '/support'
 */
buyerPage.url = (options?: RouteQueryOptions) => {
    return buyerPage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::buyerPage
 * @see app/Http/Controllers/SupportTicketController.php:26
 * @route '/support'
 */
buyerPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerPage.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::buyerPage
 * @see app/Http/Controllers/SupportTicketController.php:26
 * @route '/support'
 */
buyerPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerPage.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::buyerPage
 * @see app/Http/Controllers/SupportTicketController.php:26
 * @route '/support'
 */
    const buyerPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerPage.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::buyerPage
 * @see app/Http/Controllers/SupportTicketController.php:26
 * @route '/support'
 */
        buyerPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerPage.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::buyerPage
 * @see app/Http/Controllers/SupportTicketController.php:26
 * @route '/support'
 */
        buyerPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerPage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerPage.form = buyerPageForm
/**
* @see \App\Http\Controllers\SupportTicketController::sellerPage
 * @see app/Http/Controllers/SupportTicketController.php:31
 * @route '/seller/support'
 */
export const sellerPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerPage.url(options),
    method: 'get',
})

sellerPage.definition = {
    methods: ["get","head"],
    url: '/seller/support',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportTicketController::sellerPage
 * @see app/Http/Controllers/SupportTicketController.php:31
 * @route '/seller/support'
 */
sellerPage.url = (options?: RouteQueryOptions) => {
    return sellerPage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportTicketController::sellerPage
 * @see app/Http/Controllers/SupportTicketController.php:31
 * @route '/seller/support'
 */
sellerPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerPage.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportTicketController::sellerPage
 * @see app/Http/Controllers/SupportTicketController.php:31
 * @route '/seller/support'
 */
sellerPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sellerPage.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportTicketController::sellerPage
 * @see app/Http/Controllers/SupportTicketController.php:31
 * @route '/seller/support'
 */
    const sellerPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sellerPage.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportTicketController::sellerPage
 * @see app/Http/Controllers/SupportTicketController.php:31
 * @route '/seller/support'
 */
        sellerPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerPage.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportTicketController::sellerPage
 * @see app/Http/Controllers/SupportTicketController.php:31
 * @route '/seller/support'
 */
        sellerPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerPage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    sellerPage.form = sellerPageForm
const SupportTicketController = { index, store, show, reply, buyerPage, sellerPage }

export default SupportTicketController