import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import registrations from './registrations'
import sellerApprovalDe7003 from './seller-approval'
import logisticsApproval9dc57a from './logistics-approval'
/**
* @see \App\Http\Controllers\Admin\AdminController::login
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::login
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::login
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::login
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::login
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: login.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::login
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
        loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::login
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
        loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    login.form = loginForm
/**
* @see \App\Http\Controllers\Admin\AdminController::verify
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/admin/verify'
 */
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/admin/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::verify
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/admin/verify'
 */
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::verify
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/admin/verify'
 */
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::verify
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/admin/verify'
 */
    const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verify.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::verify
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/admin/verify'
 */
        verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verify.url(options),
            method: 'post',
        })
    
    verify.form = verifyForm
/**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:55
 * @route '/admin/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:55
 * @route '/admin/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:55
 * @route '/admin/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:55
 * @route '/admin/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:55
 * @route '/admin/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:55
 * @route '/admin/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:55
 * @route '/admin/dashboard'
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
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:12
 * @route '/admin/vouchers'
 */
export const vouchers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vouchers.url(options),
    method: 'get',
})

vouchers.definition = {
    methods: ["get","head"],
    url: '/admin/vouchers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:12
 * @route '/admin/vouchers'
 */
vouchers.url = (options?: RouteQueryOptions) => {
    return vouchers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:12
 * @route '/admin/vouchers'
 */
vouchers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vouchers.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:12
 * @route '/admin/vouchers'
 */
vouchers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vouchers.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:12
 * @route '/admin/vouchers'
 */
    const vouchersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vouchers.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:12
 * @route '/admin/vouchers'
 */
        vouchersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vouchers.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:12
 * @route '/admin/vouchers'
 */
        vouchersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vouchers.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vouchers.form = vouchersForm
/**
 * @see routes/web.php:1930
 * @route '/admin/banners'
 */
export const banners = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: banners.url(options),
    method: 'get',
})

banners.definition = {
    methods: ["get","head"],
    url: '/admin/banners',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1930
 * @route '/admin/banners'
 */
banners.url = (options?: RouteQueryOptions) => {
    return banners.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1930
 * @route '/admin/banners'
 */
banners.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: banners.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1930
 * @route '/admin/banners'
 */
banners.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: banners.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1930
 * @route '/admin/banners'
 */
    const bannersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: banners.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1930
 * @route '/admin/banners'
 */
        bannersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: banners.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1930
 * @route '/admin/banners'
 */
        bannersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: banners.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    banners.form = bannersForm
/**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:120
 * @route '/admin/manage-registrations'
 */
export const manageRegistrations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRegistrations.url(options),
    method: 'get',
})

manageRegistrations.definition = {
    methods: ["get","head"],
    url: '/admin/manage-registrations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:120
 * @route '/admin/manage-registrations'
 */
manageRegistrations.url = (options?: RouteQueryOptions) => {
    return manageRegistrations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:120
 * @route '/admin/manage-registrations'
 */
manageRegistrations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRegistrations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:120
 * @route '/admin/manage-registrations'
 */
manageRegistrations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageRegistrations.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:120
 * @route '/admin/manage-registrations'
 */
    const manageRegistrationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: manageRegistrations.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:120
 * @route '/admin/manage-registrations'
 */
        manageRegistrationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: manageRegistrations.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:120
 * @route '/admin/manage-registrations'
 */
        manageRegistrationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: manageRegistrations.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    manageRegistrations.form = manageRegistrationsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:154
 * @route '/admin/seller-approval'
 */
export const sellerApproval = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerApproval.url(options),
    method: 'get',
})

sellerApproval.definition = {
    methods: ["get","head"],
    url: '/admin/seller-approval',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:154
 * @route '/admin/seller-approval'
 */
sellerApproval.url = (options?: RouteQueryOptions) => {
    return sellerApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:154
 * @route '/admin/seller-approval'
 */
sellerApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:154
 * @route '/admin/seller-approval'
 */
sellerApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sellerApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:154
 * @route '/admin/seller-approval'
 */
    const sellerApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sellerApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:154
 * @route '/admin/seller-approval'
 */
        sellerApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:154
 * @route '/admin/seller-approval'
 */
        sellerApprovalForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerApproval.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    sellerApproval.form = sellerApprovalForm
/**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:441
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
export const downloadDocument = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadDocument.url(args, options),
    method: 'get',
})

downloadDocument.definition = {
    methods: ["get","head"],
    url: '/admin/seller-approval/{userId}/download/{type}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:441
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
downloadDocument.url = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                    type: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                                type: args.type,
                }

    return downloadDocument.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace('{type}', parsedArgs.type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:441
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
downloadDocument.get = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadDocument.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:441
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
downloadDocument.head = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloadDocument.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:441
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
    const downloadDocumentForm = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: downloadDocument.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:441
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
        downloadDocumentForm.get = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: downloadDocument.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:441
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
        downloadDocumentForm.head = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: downloadDocument.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    downloadDocument.form = downloadDocumentForm
/**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:190
 * @route '/admin/logistics-approval'
 */
export const logisticsApproval = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logisticsApproval.url(options),
    method: 'get',
})

logisticsApproval.definition = {
    methods: ["get","head"],
    url: '/admin/logistics-approval',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:190
 * @route '/admin/logistics-approval'
 */
logisticsApproval.url = (options?: RouteQueryOptions) => {
    return logisticsApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:190
 * @route '/admin/logistics-approval'
 */
logisticsApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logisticsApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:190
 * @route '/admin/logistics-approval'
 */
logisticsApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logisticsApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:190
 * @route '/admin/logistics-approval'
 */
    const logisticsApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: logisticsApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:190
 * @route '/admin/logistics-approval'
 */
        logisticsApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: logisticsApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:190
 * @route '/admin/logistics-approval'
 */
        logisticsApprovalForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: logisticsApproval.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    logisticsApproval.form = logisticsApprovalForm
/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:225
 * @route '/admin/product-approval'
 */
export const productApproval = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productApproval.url(options),
    method: 'get',
})

productApproval.definition = {
    methods: ["get","head"],
    url: '/admin/product-approval',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:225
 * @route '/admin/product-approval'
 */
productApproval.url = (options?: RouteQueryOptions) => {
    return productApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:225
 * @route '/admin/product-approval'
 */
productApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:225
 * @route '/admin/product-approval'
 */
productApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: productApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:225
 * @route '/admin/product-approval'
 */
    const productApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: productApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:225
 * @route '/admin/product-approval'
 */
        productApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:225
 * @route '/admin/product-approval'
 */
        productApprovalForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productApproval.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    productApproval.form = productApprovalForm
/**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:233
 * @route '/admin/reports'
 */
export const reports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})

reports.definition = {
    methods: ["get","head"],
    url: '/admin/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:233
 * @route '/admin/reports'
 */
reports.url = (options?: RouteQueryOptions) => {
    return reports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:233
 * @route '/admin/reports'
 */
reports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:233
 * @route '/admin/reports'
 */
reports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:233
 * @route '/admin/reports'
 */
    const reportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:233
 * @route '/admin/reports'
 */
        reportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:233
 * @route '/admin/reports'
 */
        reportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    reports.form = reportsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:463
 * @route '/admin/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/admin/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:463
 * @route '/admin/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:463
 * @route '/admin/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:463
 * @route '/admin/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:463
 * @route '/admin/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
const admin = {
    login: Object.assign(login, login),
verify: Object.assign(verify, verify),
dashboard: Object.assign(dashboard, dashboard),
vouchers: Object.assign(vouchers, vouchers),
banners: Object.assign(banners, banners),
manageRegistrations: Object.assign(manageRegistrations, manageRegistrations),
registrations: Object.assign(registrations, registrations),
sellerApproval: Object.assign(sellerApproval, sellerApprovalDe7003),
downloadDocument: Object.assign(downloadDocument, downloadDocument),
logisticsApproval: Object.assign(logisticsApproval, logisticsApproval9dc57a),
productApproval: Object.assign(productApproval, productApproval),
reports: Object.assign(reports, reports),
logout: Object.assign(logout, logout),
}

export default admin