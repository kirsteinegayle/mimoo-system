import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/courier-app/messaging/contacts'
 */
const contacts99f2dbc5b0e433eda5d6946e898499f7 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts99f2dbc5b0e433eda5d6946e898499f7.url(options),
    method: 'get',
})

contacts99f2dbc5b0e433eda5d6946e898499f7.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/messaging/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/courier-app/messaging/contacts'
 */
contacts99f2dbc5b0e433eda5d6946e898499f7.url = (options?: RouteQueryOptions) => {
    return contacts99f2dbc5b0e433eda5d6946e898499f7.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/courier-app/messaging/contacts'
 */
contacts99f2dbc5b0e433eda5d6946e898499f7.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts99f2dbc5b0e433eda5d6946e898499f7.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/courier-app/messaging/contacts'
 */
contacts99f2dbc5b0e433eda5d6946e898499f7.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contacts99f2dbc5b0e433eda5d6946e898499f7.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/courier-app/messaging/contacts'
 */
    const contacts99f2dbc5b0e433eda5d6946e898499f7Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: contacts99f2dbc5b0e433eda5d6946e898499f7.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/courier-app/messaging/contacts'
 */
        contacts99f2dbc5b0e433eda5d6946e898499f7Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts99f2dbc5b0e433eda5d6946e898499f7.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/courier-app/messaging/contacts'
 */
        contacts99f2dbc5b0e433eda5d6946e898499f7Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts99f2dbc5b0e433eda5d6946e898499f7.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    contacts99f2dbc5b0e433eda5d6946e898499f7.form = contacts99f2dbc5b0e433eda5d6946e898499f7Form
    /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/rider-app/messaging/contacts'
 */
const contacts65f866cd947fb2c8eedf5055fb1a8391 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts65f866cd947fb2c8eedf5055fb1a8391.url(options),
    method: 'get',
})

contacts65f866cd947fb2c8eedf5055fb1a8391.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/messaging/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/rider-app/messaging/contacts'
 */
contacts65f866cd947fb2c8eedf5055fb1a8391.url = (options?: RouteQueryOptions) => {
    return contacts65f866cd947fb2c8eedf5055fb1a8391.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/rider-app/messaging/contacts'
 */
contacts65f866cd947fb2c8eedf5055fb1a8391.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts65f866cd947fb2c8eedf5055fb1a8391.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/rider-app/messaging/contacts'
 */
contacts65f866cd947fb2c8eedf5055fb1a8391.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contacts65f866cd947fb2c8eedf5055fb1a8391.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/rider-app/messaging/contacts'
 */
    const contacts65f866cd947fb2c8eedf5055fb1a8391Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: contacts65f866cd947fb2c8eedf5055fb1a8391.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/rider-app/messaging/contacts'
 */
        contacts65f866cd947fb2c8eedf5055fb1a8391Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts65f866cd947fb2c8eedf5055fb1a8391.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/api/rider-app/messaging/contacts'
 */
        contacts65f866cd947fb2c8eedf5055fb1a8391Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts65f866cd947fb2c8eedf5055fb1a8391.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    contacts65f866cd947fb2c8eedf5055fb1a8391.form = contacts65f866cd947fb2c8eedf5055fb1a8391Form
    /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/messaging/contacts'
 */
const contacts5764e2c22d368e69a5649da4506cec22 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts5764e2c22d368e69a5649da4506cec22.url(options),
    method: 'get',
})

contacts5764e2c22d368e69a5649da4506cec22.definition = {
    methods: ["get","head"],
    url: '/messaging/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/messaging/contacts'
 */
contacts5764e2c22d368e69a5649da4506cec22.url = (options?: RouteQueryOptions) => {
    return contacts5764e2c22d368e69a5649da4506cec22.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/messaging/contacts'
 */
contacts5764e2c22d368e69a5649da4506cec22.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts5764e2c22d368e69a5649da4506cec22.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/messaging/contacts'
 */
contacts5764e2c22d368e69a5649da4506cec22.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contacts5764e2c22d368e69a5649da4506cec22.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/messaging/contacts'
 */
    const contacts5764e2c22d368e69a5649da4506cec22Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: contacts5764e2c22d368e69a5649da4506cec22.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/messaging/contacts'
 */
        contacts5764e2c22d368e69a5649da4506cec22Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts5764e2c22d368e69a5649da4506cec22.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/messaging/contacts'
 */
        contacts5764e2c22d368e69a5649da4506cec22Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts5764e2c22d368e69a5649da4506cec22.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    contacts5764e2c22d368e69a5649da4506cec22.form = contacts5764e2c22d368e69a5649da4506cec22Form
    /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/admin/messaging/contacts'
 */
const contacts433d836913ee786bb270490fa45c429e = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts433d836913ee786bb270490fa45c429e.url(options),
    method: 'get',
})

contacts433d836913ee786bb270490fa45c429e.definition = {
    methods: ["get","head"],
    url: '/admin/messaging/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/admin/messaging/contacts'
 */
contacts433d836913ee786bb270490fa45c429e.url = (options?: RouteQueryOptions) => {
    return contacts433d836913ee786bb270490fa45c429e.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/admin/messaging/contacts'
 */
contacts433d836913ee786bb270490fa45c429e.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts433d836913ee786bb270490fa45c429e.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/admin/messaging/contacts'
 */
contacts433d836913ee786bb270490fa45c429e.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contacts433d836913ee786bb270490fa45c429e.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/admin/messaging/contacts'
 */
    const contacts433d836913ee786bb270490fa45c429eForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: contacts433d836913ee786bb270490fa45c429e.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/admin/messaging/contacts'
 */
        contacts433d836913ee786bb270490fa45c429eForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts433d836913ee786bb270490fa45c429e.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::contacts
 * @see app/Http/Controllers/MessagingController.php:95
 * @route '/admin/messaging/contacts'
 */
        contacts433d836913ee786bb270490fa45c429eForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contacts433d836913ee786bb270490fa45c429e.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    contacts433d836913ee786bb270490fa45c429e.form = contacts433d836913ee786bb270490fa45c429eForm

/**
* Multiple routes resolve to \App\Http\Controllers\MessagingController::contacts, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `contacts['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const contacts = {
    '/api/courier-app/messaging/contacts': contacts99f2dbc5b0e433eda5d6946e898499f7,
    '/api/rider-app/messaging/contacts': contacts65f866cd947fb2c8eedf5055fb1a8391,
    '/messaging/contacts': contacts5764e2c22d368e69a5649da4506cec22,
    '/admin/messaging/contacts': contacts433d836913ee786bb270490fa45c429e,
}

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/courier-app/messaging/threads'
 */
const threadse08d7a3d9056fb311d2071c52d87189e = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threadse08d7a3d9056fb311d2071c52d87189e.url(options),
    method: 'get',
})

threadse08d7a3d9056fb311d2071c52d87189e.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/messaging/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/courier-app/messaging/threads'
 */
threadse08d7a3d9056fb311d2071c52d87189e.url = (options?: RouteQueryOptions) => {
    return threadse08d7a3d9056fb311d2071c52d87189e.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/courier-app/messaging/threads'
 */
threadse08d7a3d9056fb311d2071c52d87189e.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threadse08d7a3d9056fb311d2071c52d87189e.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/courier-app/messaging/threads'
 */
threadse08d7a3d9056fb311d2071c52d87189e.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: threadse08d7a3d9056fb311d2071c52d87189e.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/courier-app/messaging/threads'
 */
    const threadse08d7a3d9056fb311d2071c52d87189eForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: threadse08d7a3d9056fb311d2071c52d87189e.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/courier-app/messaging/threads'
 */
        threadse08d7a3d9056fb311d2071c52d87189eForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threadse08d7a3d9056fb311d2071c52d87189e.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/courier-app/messaging/threads'
 */
        threadse08d7a3d9056fb311d2071c52d87189eForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threadse08d7a3d9056fb311d2071c52d87189e.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    threadse08d7a3d9056fb311d2071c52d87189e.form = threadse08d7a3d9056fb311d2071c52d87189eForm
    /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/rider-app/messaging/threads'
 */
const threadsc989ddd62369c253cb83e50f03450883 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threadsc989ddd62369c253cb83e50f03450883.url(options),
    method: 'get',
})

threadsc989ddd62369c253cb83e50f03450883.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/messaging/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/rider-app/messaging/threads'
 */
threadsc989ddd62369c253cb83e50f03450883.url = (options?: RouteQueryOptions) => {
    return threadsc989ddd62369c253cb83e50f03450883.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/rider-app/messaging/threads'
 */
threadsc989ddd62369c253cb83e50f03450883.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threadsc989ddd62369c253cb83e50f03450883.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/rider-app/messaging/threads'
 */
threadsc989ddd62369c253cb83e50f03450883.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: threadsc989ddd62369c253cb83e50f03450883.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/rider-app/messaging/threads'
 */
    const threadsc989ddd62369c253cb83e50f03450883Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: threadsc989ddd62369c253cb83e50f03450883.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/rider-app/messaging/threads'
 */
        threadsc989ddd62369c253cb83e50f03450883Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threadsc989ddd62369c253cb83e50f03450883.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/api/rider-app/messaging/threads'
 */
        threadsc989ddd62369c253cb83e50f03450883Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threadsc989ddd62369c253cb83e50f03450883.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    threadsc989ddd62369c253cb83e50f03450883.form = threadsc989ddd62369c253cb83e50f03450883Form
    /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/messaging/threads'
 */
const threads666df28610d04ede46b3b9b19a3d6478 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads666df28610d04ede46b3b9b19a3d6478.url(options),
    method: 'get',
})

threads666df28610d04ede46b3b9b19a3d6478.definition = {
    methods: ["get","head"],
    url: '/messaging/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/messaging/threads'
 */
threads666df28610d04ede46b3b9b19a3d6478.url = (options?: RouteQueryOptions) => {
    return threads666df28610d04ede46b3b9b19a3d6478.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/messaging/threads'
 */
threads666df28610d04ede46b3b9b19a3d6478.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads666df28610d04ede46b3b9b19a3d6478.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/messaging/threads'
 */
threads666df28610d04ede46b3b9b19a3d6478.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: threads666df28610d04ede46b3b9b19a3d6478.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/messaging/threads'
 */
    const threads666df28610d04ede46b3b9b19a3d6478Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: threads666df28610d04ede46b3b9b19a3d6478.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/messaging/threads'
 */
        threads666df28610d04ede46b3b9b19a3d6478Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads666df28610d04ede46b3b9b19a3d6478.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/messaging/threads'
 */
        threads666df28610d04ede46b3b9b19a3d6478Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads666df28610d04ede46b3b9b19a3d6478.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    threads666df28610d04ede46b3b9b19a3d6478.form = threads666df28610d04ede46b3b9b19a3d6478Form
    /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/admin/messaging/threads'
 */
const threads24309fe3296a5e202fa2fdbb048ad822 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads24309fe3296a5e202fa2fdbb048ad822.url(options),
    method: 'get',
})

threads24309fe3296a5e202fa2fdbb048ad822.definition = {
    methods: ["get","head"],
    url: '/admin/messaging/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/admin/messaging/threads'
 */
threads24309fe3296a5e202fa2fdbb048ad822.url = (options?: RouteQueryOptions) => {
    return threads24309fe3296a5e202fa2fdbb048ad822.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/admin/messaging/threads'
 */
threads24309fe3296a5e202fa2fdbb048ad822.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads24309fe3296a5e202fa2fdbb048ad822.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/admin/messaging/threads'
 */
threads24309fe3296a5e202fa2fdbb048ad822.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: threads24309fe3296a5e202fa2fdbb048ad822.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/admin/messaging/threads'
 */
    const threads24309fe3296a5e202fa2fdbb048ad822Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: threads24309fe3296a5e202fa2fdbb048ad822.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/admin/messaging/threads'
 */
        threads24309fe3296a5e202fa2fdbb048ad822Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads24309fe3296a5e202fa2fdbb048ad822.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::threads
 * @see app/Http/Controllers/MessagingController.php:102
 * @route '/admin/messaging/threads'
 */
        threads24309fe3296a5e202fa2fdbb048ad822Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads24309fe3296a5e202fa2fdbb048ad822.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    threads24309fe3296a5e202fa2fdbb048ad822.form = threads24309fe3296a5e202fa2fdbb048ad822Form

/**
* Multiple routes resolve to \App\Http\Controllers\MessagingController::threads, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `threads['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const threads = {
    '/api/courier-app/messaging/threads': threadse08d7a3d9056fb311d2071c52d87189e,
    '/api/rider-app/messaging/threads': threadsc989ddd62369c253cb83e50f03450883,
    '/messaging/threads': threads666df28610d04ede46b3b9b19a3d6478,
    '/admin/messaging/threads': threads24309fe3296a5e202fa2fdbb048ad822,
}

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/courier-app/messaging/start'
 */
const start94a0363bff313e6c1d74f851d444dd45 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start94a0363bff313e6c1d74f851d444dd45.url(options),
    method: 'post',
})

start94a0363bff313e6c1d74f851d444dd45.definition = {
    methods: ["post"],
    url: '/api/courier-app/messaging/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/courier-app/messaging/start'
 */
start94a0363bff313e6c1d74f851d444dd45.url = (options?: RouteQueryOptions) => {
    return start94a0363bff313e6c1d74f851d444dd45.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/courier-app/messaging/start'
 */
start94a0363bff313e6c1d74f851d444dd45.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start94a0363bff313e6c1d74f851d444dd45.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/courier-app/messaging/start'
 */
    const start94a0363bff313e6c1d74f851d444dd45Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start94a0363bff313e6c1d74f851d444dd45.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/courier-app/messaging/start'
 */
        start94a0363bff313e6c1d74f851d444dd45Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: start94a0363bff313e6c1d74f851d444dd45.url(options),
            method: 'post',
        })
    
    start94a0363bff313e6c1d74f851d444dd45.form = start94a0363bff313e6c1d74f851d444dd45Form
    /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/rider-app/messaging/start'
 */
const start45fd6f86f3e3c9d4ba0c610afe7775ee = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start45fd6f86f3e3c9d4ba0c610afe7775ee.url(options),
    method: 'post',
})

start45fd6f86f3e3c9d4ba0c610afe7775ee.definition = {
    methods: ["post"],
    url: '/api/rider-app/messaging/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/rider-app/messaging/start'
 */
start45fd6f86f3e3c9d4ba0c610afe7775ee.url = (options?: RouteQueryOptions) => {
    return start45fd6f86f3e3c9d4ba0c610afe7775ee.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/rider-app/messaging/start'
 */
start45fd6f86f3e3c9d4ba0c610afe7775ee.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start45fd6f86f3e3c9d4ba0c610afe7775ee.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/rider-app/messaging/start'
 */
    const start45fd6f86f3e3c9d4ba0c610afe7775eeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start45fd6f86f3e3c9d4ba0c610afe7775ee.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/api/rider-app/messaging/start'
 */
        start45fd6f86f3e3c9d4ba0c610afe7775eeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: start45fd6f86f3e3c9d4ba0c610afe7775ee.url(options),
            method: 'post',
        })
    
    start45fd6f86f3e3c9d4ba0c610afe7775ee.form = start45fd6f86f3e3c9d4ba0c610afe7775eeForm
    /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/messaging/start'
 */
const starta4dcc59b19e74e686583ddbe06f04a13 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: starta4dcc59b19e74e686583ddbe06f04a13.url(options),
    method: 'post',
})

starta4dcc59b19e74e686583ddbe06f04a13.definition = {
    methods: ["post"],
    url: '/messaging/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/messaging/start'
 */
starta4dcc59b19e74e686583ddbe06f04a13.url = (options?: RouteQueryOptions) => {
    return starta4dcc59b19e74e686583ddbe06f04a13.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/messaging/start'
 */
starta4dcc59b19e74e686583ddbe06f04a13.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: starta4dcc59b19e74e686583ddbe06f04a13.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/messaging/start'
 */
    const starta4dcc59b19e74e686583ddbe06f04a13Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: starta4dcc59b19e74e686583ddbe06f04a13.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/messaging/start'
 */
        starta4dcc59b19e74e686583ddbe06f04a13Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: starta4dcc59b19e74e686583ddbe06f04a13.url(options),
            method: 'post',
        })
    
    starta4dcc59b19e74e686583ddbe06f04a13.form = starta4dcc59b19e74e686583ddbe06f04a13Form
    /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/admin/messaging/start'
 */
const startb5c9f2a4e28781f8156824475d7e6778 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startb5c9f2a4e28781f8156824475d7e6778.url(options),
    method: 'post',
})

startb5c9f2a4e28781f8156824475d7e6778.definition = {
    methods: ["post"],
    url: '/admin/messaging/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/admin/messaging/start'
 */
startb5c9f2a4e28781f8156824475d7e6778.url = (options?: RouteQueryOptions) => {
    return startb5c9f2a4e28781f8156824475d7e6778.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/admin/messaging/start'
 */
startb5c9f2a4e28781f8156824475d7e6778.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startb5c9f2a4e28781f8156824475d7e6778.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/admin/messaging/start'
 */
    const startb5c9f2a4e28781f8156824475d7e6778Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: startb5c9f2a4e28781f8156824475d7e6778.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::start
 * @see app/Http/Controllers/MessagingController.php:113
 * @route '/admin/messaging/start'
 */
        startb5c9f2a4e28781f8156824475d7e6778Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: startb5c9f2a4e28781f8156824475d7e6778.url(options),
            method: 'post',
        })
    
    startb5c9f2a4e28781f8156824475d7e6778.form = startb5c9f2a4e28781f8156824475d7e6778Form

/**
* Multiple routes resolve to \App\Http\Controllers\MessagingController::start, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `start['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const start = {
    '/api/courier-app/messaging/start': start94a0363bff313e6c1d74f851d444dd45,
    '/api/rider-app/messaging/start': start45fd6f86f3e3c9d4ba0c610afe7775ee,
    '/messaging/start': starta4dcc59b19e74e686583ddbe06f04a13,
    '/admin/messaging/start': startb5c9f2a4e28781f8156824475d7e6778,
}

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
const messages919093515162affc8167623ea9070af1 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages919093515162affc8167623ea9070af1.url(args, options),
    method: 'get',
})

messages919093515162affc8167623ea9070af1.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
messages919093515162affc8167623ea9070af1.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messages919093515162affc8167623ea9070af1.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
messages919093515162affc8167623ea9070af1.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages919093515162affc8167623ea9070af1.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
messages919093515162affc8167623ea9070af1.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages919093515162affc8167623ea9070af1.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
    const messages919093515162affc8167623ea9070af1Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages919093515162affc8167623ea9070af1.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
        messages919093515162affc8167623ea9070af1Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages919093515162affc8167623ea9070af1.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
        messages919093515162affc8167623ea9070af1Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages919093515162affc8167623ea9070af1.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messages919093515162affc8167623ea9070af1.form = messages919093515162affc8167623ea9070af1Form
    /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
const messagesc7cf492ed2120c56900363e0282acc3c = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesc7cf492ed2120c56900363e0282acc3c.url(args, options),
    method: 'get',
})

messagesc7cf492ed2120c56900363e0282acc3c.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
messagesc7cf492ed2120c56900363e0282acc3c.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messagesc7cf492ed2120c56900363e0282acc3c.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
messagesc7cf492ed2120c56900363e0282acc3c.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesc7cf492ed2120c56900363e0282acc3c.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
messagesc7cf492ed2120c56900363e0282acc3c.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messagesc7cf492ed2120c56900363e0282acc3c.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
    const messagesc7cf492ed2120c56900363e0282acc3cForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messagesc7cf492ed2120c56900363e0282acc3c.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
        messagesc7cf492ed2120c56900363e0282acc3cForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messagesc7cf492ed2120c56900363e0282acc3c.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
        messagesc7cf492ed2120c56900363e0282acc3cForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messagesc7cf492ed2120c56900363e0282acc3c.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messagesc7cf492ed2120c56900363e0282acc3c.form = messagesc7cf492ed2120c56900363e0282acc3cForm
    /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/messaging/threads/{id}/messages'
 */
const messages2ab2aaac96f3db228e4111668b58393f = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages2ab2aaac96f3db228e4111668b58393f.url(args, options),
    method: 'get',
})

messages2ab2aaac96f3db228e4111668b58393f.definition = {
    methods: ["get","head"],
    url: '/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/messaging/threads/{id}/messages'
 */
messages2ab2aaac96f3db228e4111668b58393f.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messages2ab2aaac96f3db228e4111668b58393f.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/messaging/threads/{id}/messages'
 */
messages2ab2aaac96f3db228e4111668b58393f.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages2ab2aaac96f3db228e4111668b58393f.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/messaging/threads/{id}/messages'
 */
messages2ab2aaac96f3db228e4111668b58393f.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages2ab2aaac96f3db228e4111668b58393f.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/messaging/threads/{id}/messages'
 */
    const messages2ab2aaac96f3db228e4111668b58393fForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages2ab2aaac96f3db228e4111668b58393f.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/messaging/threads/{id}/messages'
 */
        messages2ab2aaac96f3db228e4111668b58393fForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages2ab2aaac96f3db228e4111668b58393f.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/messaging/threads/{id}/messages'
 */
        messages2ab2aaac96f3db228e4111668b58393fForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages2ab2aaac96f3db228e4111668b58393f.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messages2ab2aaac96f3db228e4111668b58393f.form = messages2ab2aaac96f3db228e4111668b58393fForm
    /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/admin/messaging/threads/{id}/messages'
 */
const messagesa3c2d209e77c92a6e8f931a5126ca7c5 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesa3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
    method: 'get',
})

messagesa3c2d209e77c92a6e8f931a5126ca7c5.definition = {
    methods: ["get","head"],
    url: '/admin/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/admin/messaging/threads/{id}/messages'
 */
messagesa3c2d209e77c92a6e8f931a5126ca7c5.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messagesa3c2d209e77c92a6e8f931a5126ca7c5.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/admin/messaging/threads/{id}/messages'
 */
messagesa3c2d209e77c92a6e8f931a5126ca7c5.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesa3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/admin/messaging/threads/{id}/messages'
 */
messagesa3c2d209e77c92a6e8f931a5126ca7c5.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messagesa3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/admin/messaging/threads/{id}/messages'
 */
    const messagesa3c2d209e77c92a6e8f931a5126ca7c5Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messagesa3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/admin/messaging/threads/{id}/messages'
 */
        messagesa3c2d209e77c92a6e8f931a5126ca7c5Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messagesa3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::messages
 * @see app/Http/Controllers/MessagingController.php:130
 * @route '/admin/messaging/threads/{id}/messages'
 */
        messagesa3c2d209e77c92a6e8f931a5126ca7c5Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messagesa3c2d209e77c92a6e8f931a5126ca7c5.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messagesa3c2d209e77c92a6e8f931a5126ca7c5.form = messagesa3c2d209e77c92a6e8f931a5126ca7c5Form

/**
* Multiple routes resolve to \App\Http\Controllers\MessagingController::messages, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `messages['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const messages = {
    '/api/courier-app/messaging/threads/{id}/messages': messages919093515162affc8167623ea9070af1,
    '/api/rider-app/messaging/threads/{id}/messages': messagesc7cf492ed2120c56900363e0282acc3c,
    '/messaging/threads/{id}/messages': messages2ab2aaac96f3db228e4111668b58393f,
    '/admin/messaging/threads/{id}/messages': messagesa3c2d209e77c92a6e8f931a5126ca7c5,
}

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
const send919093515162affc8167623ea9070af1 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send919093515162affc8167623ea9070af1.url(args, options),
    method: 'post',
})

send919093515162affc8167623ea9070af1.definition = {
    methods: ["post"],
    url: '/api/courier-app/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
send919093515162affc8167623ea9070af1.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return send919093515162affc8167623ea9070af1.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
send919093515162affc8167623ea9070af1.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send919093515162affc8167623ea9070af1.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
    const send919093515162affc8167623ea9070af1Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send919093515162affc8167623ea9070af1.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/courier-app/messaging/threads/{id}/messages'
 */
        send919093515162affc8167623ea9070af1Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send919093515162affc8167623ea9070af1.url(args, options),
            method: 'post',
        })
    
    send919093515162affc8167623ea9070af1.form = send919093515162affc8167623ea9070af1Form
    /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
const sendc7cf492ed2120c56900363e0282acc3c = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendc7cf492ed2120c56900363e0282acc3c.url(args, options),
    method: 'post',
})

sendc7cf492ed2120c56900363e0282acc3c.definition = {
    methods: ["post"],
    url: '/api/rider-app/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
sendc7cf492ed2120c56900363e0282acc3c.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return sendc7cf492ed2120c56900363e0282acc3c.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
sendc7cf492ed2120c56900363e0282acc3c.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendc7cf492ed2120c56900363e0282acc3c.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
    const sendc7cf492ed2120c56900363e0282acc3cForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sendc7cf492ed2120c56900363e0282acc3c.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/api/rider-app/messaging/threads/{id}/messages'
 */
        sendc7cf492ed2120c56900363e0282acc3cForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sendc7cf492ed2120c56900363e0282acc3c.url(args, options),
            method: 'post',
        })
    
    sendc7cf492ed2120c56900363e0282acc3c.form = sendc7cf492ed2120c56900363e0282acc3cForm
    /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/messaging/threads/{id}/messages'
 */
const send2ab2aaac96f3db228e4111668b58393f = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send2ab2aaac96f3db228e4111668b58393f.url(args, options),
    method: 'post',
})

send2ab2aaac96f3db228e4111668b58393f.definition = {
    methods: ["post"],
    url: '/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/messaging/threads/{id}/messages'
 */
send2ab2aaac96f3db228e4111668b58393f.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return send2ab2aaac96f3db228e4111668b58393f.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/messaging/threads/{id}/messages'
 */
send2ab2aaac96f3db228e4111668b58393f.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send2ab2aaac96f3db228e4111668b58393f.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/messaging/threads/{id}/messages'
 */
    const send2ab2aaac96f3db228e4111668b58393fForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send2ab2aaac96f3db228e4111668b58393f.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/messaging/threads/{id}/messages'
 */
        send2ab2aaac96f3db228e4111668b58393fForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send2ab2aaac96f3db228e4111668b58393f.url(args, options),
            method: 'post',
        })
    
    send2ab2aaac96f3db228e4111668b58393f.form = send2ab2aaac96f3db228e4111668b58393fForm
    /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/admin/messaging/threads/{id}/messages'
 */
const senda3c2d209e77c92a6e8f931a5126ca7c5 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: senda3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
    method: 'post',
})

senda3c2d209e77c92a6e8f931a5126ca7c5.definition = {
    methods: ["post"],
    url: '/admin/messaging/threads/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/admin/messaging/threads/{id}/messages'
 */
senda3c2d209e77c92a6e8f931a5126ca7c5.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return senda3c2d209e77c92a6e8f931a5126ca7c5.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/admin/messaging/threads/{id}/messages'
 */
senda3c2d209e77c92a6e8f931a5126ca7c5.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: senda3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/admin/messaging/threads/{id}/messages'
 */
    const senda3c2d209e77c92a6e8f931a5126ca7c5Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: senda3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::send
 * @see app/Http/Controllers/MessagingController.php:152
 * @route '/admin/messaging/threads/{id}/messages'
 */
        senda3c2d209e77c92a6e8f931a5126ca7c5Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: senda3c2d209e77c92a6e8f931a5126ca7c5.url(args, options),
            method: 'post',
        })
    
    senda3c2d209e77c92a6e8f931a5126ca7c5.form = senda3c2d209e77c92a6e8f931a5126ca7c5Form

/**
* Multiple routes resolve to \App\Http\Controllers\MessagingController::send, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `send['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const send = {
    '/api/courier-app/messaging/threads/{id}/messages': send919093515162affc8167623ea9070af1,
    '/api/rider-app/messaging/threads/{id}/messages': sendc7cf492ed2120c56900363e0282acc3c,
    '/messaging/threads/{id}/messages': send2ab2aaac96f3db228e4111668b58393f,
    '/admin/messaging/threads/{id}/messages': senda3c2d209e77c92a6e8f931a5126ca7c5,
}

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/courier-app/messaging/threads/{id}/read'
 */
const read567105180dd48a6bc78bd55620b07edd = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read567105180dd48a6bc78bd55620b07edd.url(args, options),
    method: 'post',
})

read567105180dd48a6bc78bd55620b07edd.definition = {
    methods: ["post"],
    url: '/api/courier-app/messaging/threads/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/courier-app/messaging/threads/{id}/read'
 */
read567105180dd48a6bc78bd55620b07edd.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return read567105180dd48a6bc78bd55620b07edd.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/courier-app/messaging/threads/{id}/read'
 */
read567105180dd48a6bc78bd55620b07edd.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read567105180dd48a6bc78bd55620b07edd.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/courier-app/messaging/threads/{id}/read'
 */
    const read567105180dd48a6bc78bd55620b07eddForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: read567105180dd48a6bc78bd55620b07edd.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/courier-app/messaging/threads/{id}/read'
 */
        read567105180dd48a6bc78bd55620b07eddForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: read567105180dd48a6bc78bd55620b07edd.url(args, options),
            method: 'post',
        })
    
    read567105180dd48a6bc78bd55620b07edd.form = read567105180dd48a6bc78bd55620b07eddForm
    /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/rider-app/messaging/threads/{id}/read'
 */
const read63518b1fbf547e987f3541849b20c6e0 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read63518b1fbf547e987f3541849b20c6e0.url(args, options),
    method: 'post',
})

read63518b1fbf547e987f3541849b20c6e0.definition = {
    methods: ["post"],
    url: '/api/rider-app/messaging/threads/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/rider-app/messaging/threads/{id}/read'
 */
read63518b1fbf547e987f3541849b20c6e0.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return read63518b1fbf547e987f3541849b20c6e0.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/rider-app/messaging/threads/{id}/read'
 */
read63518b1fbf547e987f3541849b20c6e0.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read63518b1fbf547e987f3541849b20c6e0.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/rider-app/messaging/threads/{id}/read'
 */
    const read63518b1fbf547e987f3541849b20c6e0Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: read63518b1fbf547e987f3541849b20c6e0.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/api/rider-app/messaging/threads/{id}/read'
 */
        read63518b1fbf547e987f3541849b20c6e0Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: read63518b1fbf547e987f3541849b20c6e0.url(args, options),
            method: 'post',
        })
    
    read63518b1fbf547e987f3541849b20c6e0.form = read63518b1fbf547e987f3541849b20c6e0Form
    /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/messaging/threads/{id}/read'
 */
const read53c20fa3c79c4ad4f7f1b7f334cabf5d = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read53c20fa3c79c4ad4f7f1b7f334cabf5d.url(args, options),
    method: 'post',
})

read53c20fa3c79c4ad4f7f1b7f334cabf5d.definition = {
    methods: ["post"],
    url: '/messaging/threads/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/messaging/threads/{id}/read'
 */
read53c20fa3c79c4ad4f7f1b7f334cabf5d.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return read53c20fa3c79c4ad4f7f1b7f334cabf5d.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/messaging/threads/{id}/read'
 */
read53c20fa3c79c4ad4f7f1b7f334cabf5d.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read53c20fa3c79c4ad4f7f1b7f334cabf5d.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/messaging/threads/{id}/read'
 */
    const read53c20fa3c79c4ad4f7f1b7f334cabf5dForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: read53c20fa3c79c4ad4f7f1b7f334cabf5d.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/messaging/threads/{id}/read'
 */
        read53c20fa3c79c4ad4f7f1b7f334cabf5dForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: read53c20fa3c79c4ad4f7f1b7f334cabf5d.url(args, options),
            method: 'post',
        })
    
    read53c20fa3c79c4ad4f7f1b7f334cabf5d.form = read53c20fa3c79c4ad4f7f1b7f334cabf5dForm
    /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/admin/messaging/threads/{id}/read'
 */
const read932cec2d8f9fdf14654e68bc507a6641 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read932cec2d8f9fdf14654e68bc507a6641.url(args, options),
    method: 'post',
})

read932cec2d8f9fdf14654e68bc507a6641.definition = {
    methods: ["post"],
    url: '/admin/messaging/threads/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/admin/messaging/threads/{id}/read'
 */
read932cec2d8f9fdf14654e68bc507a6641.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return read932cec2d8f9fdf14654e68bc507a6641.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/admin/messaging/threads/{id}/read'
 */
read932cec2d8f9fdf14654e68bc507a6641.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read932cec2d8f9fdf14654e68bc507a6641.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/admin/messaging/threads/{id}/read'
 */
    const read932cec2d8f9fdf14654e68bc507a6641Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: read932cec2d8f9fdf14654e68bc507a6641.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MessagingController::read
 * @see app/Http/Controllers/MessagingController.php:186
 * @route '/admin/messaging/threads/{id}/read'
 */
        read932cec2d8f9fdf14654e68bc507a6641Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: read932cec2d8f9fdf14654e68bc507a6641.url(args, options),
            method: 'post',
        })
    
    read932cec2d8f9fdf14654e68bc507a6641.form = read932cec2d8f9fdf14654e68bc507a6641Form

/**
* Multiple routes resolve to \App\Http\Controllers\MessagingController::read, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `read['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const read = {
    '/api/courier-app/messaging/threads/{id}/read': read567105180dd48a6bc78bd55620b07edd,
    '/api/rider-app/messaging/threads/{id}/read': read63518b1fbf547e987f3541849b20c6e0,
    '/messaging/threads/{id}/read': read53c20fa3c79c4ad4f7f1b7f334cabf5d,
    '/admin/messaging/threads/{id}/read': read932cec2d8f9fdf14654e68bc507a6641,
}

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/courier-app/messaging/messages/{id}/image'
 */
const image2616d361f345d14840d44f9b4f8bcabe = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image2616d361f345d14840d44f9b4f8bcabe.url(args, options),
    method: 'get',
})

image2616d361f345d14840d44f9b4f8bcabe.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/messaging/messages/{id}/image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/courier-app/messaging/messages/{id}/image'
 */
image2616d361f345d14840d44f9b4f8bcabe.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return image2616d361f345d14840d44f9b4f8bcabe.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/courier-app/messaging/messages/{id}/image'
 */
image2616d361f345d14840d44f9b4f8bcabe.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image2616d361f345d14840d44f9b4f8bcabe.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/courier-app/messaging/messages/{id}/image'
 */
image2616d361f345d14840d44f9b4f8bcabe.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: image2616d361f345d14840d44f9b4f8bcabe.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/courier-app/messaging/messages/{id}/image'
 */
    const image2616d361f345d14840d44f9b4f8bcabeForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: image2616d361f345d14840d44f9b4f8bcabe.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/courier-app/messaging/messages/{id}/image'
 */
        image2616d361f345d14840d44f9b4f8bcabeForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image2616d361f345d14840d44f9b4f8bcabe.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/courier-app/messaging/messages/{id}/image'
 */
        image2616d361f345d14840d44f9b4f8bcabeForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image2616d361f345d14840d44f9b4f8bcabe.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    image2616d361f345d14840d44f9b4f8bcabe.form = image2616d361f345d14840d44f9b4f8bcabeForm
    /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/rider-app/messaging/messages/{id}/image'
 */
const image626d096af178f20baf872393c0fb072b = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image626d096af178f20baf872393c0fb072b.url(args, options),
    method: 'get',
})

image626d096af178f20baf872393c0fb072b.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/messaging/messages/{id}/image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/rider-app/messaging/messages/{id}/image'
 */
image626d096af178f20baf872393c0fb072b.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return image626d096af178f20baf872393c0fb072b.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/rider-app/messaging/messages/{id}/image'
 */
image626d096af178f20baf872393c0fb072b.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image626d096af178f20baf872393c0fb072b.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/rider-app/messaging/messages/{id}/image'
 */
image626d096af178f20baf872393c0fb072b.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: image626d096af178f20baf872393c0fb072b.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/rider-app/messaging/messages/{id}/image'
 */
    const image626d096af178f20baf872393c0fb072bForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: image626d096af178f20baf872393c0fb072b.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/rider-app/messaging/messages/{id}/image'
 */
        image626d096af178f20baf872393c0fb072bForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image626d096af178f20baf872393c0fb072b.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/api/rider-app/messaging/messages/{id}/image'
 */
        image626d096af178f20baf872393c0fb072bForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image626d096af178f20baf872393c0fb072b.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    image626d096af178f20baf872393c0fb072b.form = image626d096af178f20baf872393c0fb072bForm
    /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/messaging/messages/{id}/image'
 */
const image18952448136d1c30af337e6946439bf8 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image18952448136d1c30af337e6946439bf8.url(args, options),
    method: 'get',
})

image18952448136d1c30af337e6946439bf8.definition = {
    methods: ["get","head"],
    url: '/messaging/messages/{id}/image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/messaging/messages/{id}/image'
 */
image18952448136d1c30af337e6946439bf8.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return image18952448136d1c30af337e6946439bf8.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/messaging/messages/{id}/image'
 */
image18952448136d1c30af337e6946439bf8.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image18952448136d1c30af337e6946439bf8.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/messaging/messages/{id}/image'
 */
image18952448136d1c30af337e6946439bf8.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: image18952448136d1c30af337e6946439bf8.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/messaging/messages/{id}/image'
 */
    const image18952448136d1c30af337e6946439bf8Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: image18952448136d1c30af337e6946439bf8.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/messaging/messages/{id}/image'
 */
        image18952448136d1c30af337e6946439bf8Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image18952448136d1c30af337e6946439bf8.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/messaging/messages/{id}/image'
 */
        image18952448136d1c30af337e6946439bf8Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image18952448136d1c30af337e6946439bf8.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    image18952448136d1c30af337e6946439bf8.form = image18952448136d1c30af337e6946439bf8Form
    /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/admin/messaging/messages/{id}/image'
 */
const imagebd4ad2848153ef913f33e0d8fe7b2b49 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: imagebd4ad2848153ef913f33e0d8fe7b2b49.url(args, options),
    method: 'get',
})

imagebd4ad2848153ef913f33e0d8fe7b2b49.definition = {
    methods: ["get","head"],
    url: '/admin/messaging/messages/{id}/image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/admin/messaging/messages/{id}/image'
 */
imagebd4ad2848153ef913f33e0d8fe7b2b49.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return imagebd4ad2848153ef913f33e0d8fe7b2b49.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/admin/messaging/messages/{id}/image'
 */
imagebd4ad2848153ef913f33e0d8fe7b2b49.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: imagebd4ad2848153ef913f33e0d8fe7b2b49.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/admin/messaging/messages/{id}/image'
 */
imagebd4ad2848153ef913f33e0d8fe7b2b49.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: imagebd4ad2848153ef913f33e0d8fe7b2b49.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/admin/messaging/messages/{id}/image'
 */
    const imagebd4ad2848153ef913f33e0d8fe7b2b49Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: imagebd4ad2848153ef913f33e0d8fe7b2b49.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/admin/messaging/messages/{id}/image'
 */
        imagebd4ad2848153ef913f33e0d8fe7b2b49Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: imagebd4ad2848153ef913f33e0d8fe7b2b49.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MessagingController::image
 * @see app/Http/Controllers/MessagingController.php:197
 * @route '/admin/messaging/messages/{id}/image'
 */
        imagebd4ad2848153ef913f33e0d8fe7b2b49Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: imagebd4ad2848153ef913f33e0d8fe7b2b49.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    imagebd4ad2848153ef913f33e0d8fe7b2b49.form = imagebd4ad2848153ef913f33e0d8fe7b2b49Form

/**
* Multiple routes resolve to \App\Http\Controllers\MessagingController::image, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `image['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const image = {
    '/api/courier-app/messaging/messages/{id}/image': image2616d361f345d14840d44f9b4f8bcabe,
    '/api/rider-app/messaging/messages/{id}/image': image626d096af178f20baf872393c0fb072b,
    '/messaging/messages/{id}/image': image18952448136d1c30af337e6946439bf8,
    '/admin/messaging/messages/{id}/image': imagebd4ad2848153ef913f33e0d8fe7b2b49,
}

const MessagingController = { contacts, threads, start, messages, send, read, image }

export default MessagingController