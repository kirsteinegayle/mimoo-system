import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import products237d17 from './products'
/**
 * @see routes/web.php:14
 * @route '/seller'
 */
export const landing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})

landing.definition = {
    methods: ["get","head"],
    url: '/seller',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:14
 * @route '/seller'
 */
landing.url = (options?: RouteQueryOptions) => {
    return landing.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:14
 * @route '/seller'
 */
landing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:14
 * @route '/seller'
 */
landing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: landing.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:14
 * @route '/seller'
 */
    const landingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: landing.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:14
 * @route '/seller'
 */
        landingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: landing.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:14
 * @route '/seller'
 */
        landingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: landing.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    landing.form = landingForm
/**
* @see \App\Http\Controllers\SellerDashboardController::dashboard
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/seller/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SellerDashboardController::dashboard
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SellerDashboardController::dashboard
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SellerDashboardController::dashboard
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SellerDashboardController::dashboard
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SellerDashboardController::dashboard
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SellerDashboardController::dashboard
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
 * @see routes/web.php:1395
 * @route '/seller/orders'
 */
export const orders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})

orders.definition = {
    methods: ["get","head"],
    url: '/seller/orders',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1395
 * @route '/seller/orders'
 */
orders.url = (options?: RouteQueryOptions) => {
    return orders.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1395
 * @route '/seller/orders'
 */
orders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1395
 * @route '/seller/orders'
 */
orders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: orders.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1395
 * @route '/seller/orders'
 */
    const ordersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: orders.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1395
 * @route '/seller/orders'
 */
        ordersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1395
 * @route '/seller/orders'
 */
        ordersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    orders.form = ordersForm
/**
 * @see routes/web.php:1403
 * @route '/seller/products'
 */
export const products = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: products.url(options),
    method: 'get',
})

products.definition = {
    methods: ["get","head"],
    url: '/seller/products',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1403
 * @route '/seller/products'
 */
products.url = (options?: RouteQueryOptions) => {
    return products.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1403
 * @route '/seller/products'
 */
products.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: products.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1403
 * @route '/seller/products'
 */
products.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: products.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1403
 * @route '/seller/products'
 */
    const productsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: products.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1403
 * @route '/seller/products'
 */
        productsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: products.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1403
 * @route '/seller/products'
 */
        productsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: products.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    products.form = productsForm
/**
 * @see routes/web.php:1460
 * @route '/seller/settings'
 */
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/seller/settings',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1460
 * @route '/seller/settings'
 */
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1460
 * @route '/seller/settings'
 */
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1460
 * @route '/seller/settings'
 */
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1460
 * @route '/seller/settings'
 */
    const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: settings.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1460
 * @route '/seller/settings'
 */
        settingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1460
 * @route '/seller/settings'
 */
        settingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    settings.form = settingsForm
/**
 * @see routes/web.php:1485
 * @route '/seller/account'
 */
export const account = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: account.url(options),
    method: 'get',
})

account.definition = {
    methods: ["get","head"],
    url: '/seller/account',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1485
 * @route '/seller/account'
 */
account.url = (options?: RouteQueryOptions) => {
    return account.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1485
 * @route '/seller/account'
 */
account.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: account.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1485
 * @route '/seller/account'
 */
account.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: account.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1485
 * @route '/seller/account'
 */
    const accountForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: account.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1485
 * @route '/seller/account'
 */
        accountForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: account.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1485
 * @route '/seller/account'
 */
        accountForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: account.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    account.form = accountForm
/**
 * @see routes/web.php:1521
 * @route '/seller/customers'
 */
export const customers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: customers.url(options),
    method: 'get',
})

customers.definition = {
    methods: ["get","head"],
    url: '/seller/customers',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1521
 * @route '/seller/customers'
 */
customers.url = (options?: RouteQueryOptions) => {
    return customers.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1521
 * @route '/seller/customers'
 */
customers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: customers.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1521
 * @route '/seller/customers'
 */
customers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: customers.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1521
 * @route '/seller/customers'
 */
    const customersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: customers.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1521
 * @route '/seller/customers'
 */
        customersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: customers.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1521
 * @route '/seller/customers'
 */
        customersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: customers.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    customers.form = customersForm
/**
 * @see routes/web.php:1526
 * @route '/seller/analytics'
 */
export const analytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/seller/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1526
 * @route '/seller/analytics'
 */
analytics.url = (options?: RouteQueryOptions) => {
    return analytics.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1526
 * @route '/seller/analytics'
 */
analytics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1526
 * @route '/seller/analytics'
 */
analytics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1526
 * @route '/seller/analytics'
 */
    const analyticsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: analytics.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1526
 * @route '/seller/analytics'
 */
        analyticsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: analytics.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1526
 * @route '/seller/analytics'
 */
        analyticsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: analytics.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    analytics.form = analyticsForm
/**
 * @see routes/web.php:1531
 * @route '/seller/messages'
 */
export const messages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/seller/messages',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1531
 * @route '/seller/messages'
 */
messages.url = (options?: RouteQueryOptions) => {
    return messages.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1531
 * @route '/seller/messages'
 */
messages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1531
 * @route '/seller/messages'
 */
messages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1531
 * @route '/seller/messages'
 */
    const messagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1531
 * @route '/seller/messages'
 */
        messagesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1531
 * @route '/seller/messages'
 */
        messagesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messages.form = messagesForm
/**
 * @see routes/web.php:1575
 * @route '/seller/pending-approval'
 */
export const pendingApproval = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pendingApproval.url(options),
    method: 'get',
})

pendingApproval.definition = {
    methods: ["get","head"],
    url: '/seller/pending-approval',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1575
 * @route '/seller/pending-approval'
 */
pendingApproval.url = (options?: RouteQueryOptions) => {
    return pendingApproval.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1575
 * @route '/seller/pending-approval'
 */
pendingApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pendingApproval.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1575
 * @route '/seller/pending-approval'
 */
pendingApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pendingApproval.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1575
 * @route '/seller/pending-approval'
 */
    const pendingApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pendingApproval.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1575
 * @route '/seller/pending-approval'
 */
        pendingApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pendingApproval.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1575
 * @route '/seller/pending-approval'
 */
        pendingApprovalForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pendingApproval.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pendingApproval.form = pendingApprovalForm
/**
 * @see routes/web.php:1758
 * @route '/seller/{id}'
 */
export const view = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/seller/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1758
 * @route '/seller/{id}'
 */
view.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return view.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see routes/web.php:1758
 * @route '/seller/{id}'
 */
view.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})
/**
 * @see routes/web.php:1758
 * @route '/seller/{id}'
 */
view.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(args, options),
    method: 'head',
})

    /**
 * @see routes/web.php:1758
 * @route '/seller/{id}'
 */
    const viewForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: view.url(args, options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1758
 * @route '/seller/{id}'
 */
        viewForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1758
 * @route '/seller/{id}'
 */
        viewForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    view.form = viewForm
const seller = {
    landing: Object.assign(landing, landing),
dashboard: Object.assign(dashboard, dashboard),
orders: Object.assign(orders, orders),
products: Object.assign(products, products237d17),
settings: Object.assign(settings, settings),
account: Object.assign(account, account),
customers: Object.assign(customers, customers),
analytics: Object.assign(analytics, analytics),
messages: Object.assign(messages, messages),
pendingApproval: Object.assign(pendingApproval, pendingApproval),
view: Object.assign(view, view),
}

export default seller