import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
const RedirectController74589591454daaf2bfaa8e6ecc32c566 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'get',
})

RedirectController74589591454daaf2bfaa8e6ecc32c566.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/courier/pickup-management',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.url = (options?: RouteQueryOptions) => {
    return RedirectController74589591454daaf2bfaa8e6ecc32c566.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
RedirectController74589591454daaf2bfaa8e6ecc32c566.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
    method: 'options',
})

    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
    const RedirectController74589591454daaf2bfaa8e6ecc32c566Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
        method: 'get',
    })

            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
        RedirectController74589591454daaf2bfaa8e6ecc32c566Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
            method: 'get',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
        RedirectController74589591454daaf2bfaa8e6ecc32c566Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
        RedirectController74589591454daaf2bfaa8e6ecc32c566Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url(options),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
        RedirectController74589591454daaf2bfaa8e6ecc32c566Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
        RedirectController74589591454daaf2bfaa8e6ecc32c566Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
        RedirectController74589591454daaf2bfaa8e6ecc32c566Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/courier/pickup-management'
 */
        RedirectController74589591454daaf2bfaa8e6ecc32c566Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RedirectController74589591454daaf2bfaa8e6ecc32c566.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'OPTIONS',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    RedirectController74589591454daaf2bfaa8e6ecc32c566.form = RedirectController74589591454daaf2bfaa8e6ecc32c566Form
    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
const RedirectControllerd7d96aa958d50e6cc97381ce8706fabd = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'get',
})

RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/logistics/branches-checklists',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url = (options?: RouteQueryOptions) => {
    return RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
    method: 'options',
})

    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
    const RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
        method: 'get',
    })

            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
        RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
            method: 'get',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
        RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
        RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url(options),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
        RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
        RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
        RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/logistics/branches-checklists'
 */
        RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'OPTIONS',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    RedirectControllerd7d96aa958d50e6cc97381ce8706fabd.form = RedirectControllerd7d96aa958d50e6cc97381ce8706fabdForm

/**
* Multiple routes resolve to \Illuminate\Routing\RedirectController::RedirectController, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `RedirectController['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
const RedirectController = {
    '/courier/pickup-management': RedirectController74589591454daaf2bfaa8e6ecc32c566,
    '/logistics/branches-checklists': RedirectControllerd7d96aa958d50e6cc97381ce8706fabd,
}

export default RedirectController