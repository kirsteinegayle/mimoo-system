import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:18
 * @route '/admin'
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
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:119
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
 * @see app/Http/Controllers/Admin/AdminController.php:119
 * @route '/admin/manage-registrations'
 */
manageRegistrations.url = (options?: RouteQueryOptions) => {
    return manageRegistrations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:119
 * @route '/admin/manage-registrations'
 */
manageRegistrations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRegistrations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:119
 * @route '/admin/manage-registrations'
 */
manageRegistrations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageRegistrations.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:119
 * @route '/admin/manage-registrations'
 */
    const manageRegistrationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: manageRegistrations.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:119
 * @route '/admin/manage-registrations'
 */
        manageRegistrationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: manageRegistrations.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::manageRegistrations
 * @see app/Http/Controllers/Admin/AdminController.php:119
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
* @see \App\Http\Controllers\Admin\AdminController::approveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
export const approveRegistration = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveRegistration.url(args, options),
    method: 'post',
})

approveRegistration.definition = {
    methods: ["post"],
    url: '/admin/registrations/{userId}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::approveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
approveRegistration.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return approveRegistration.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::approveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
approveRegistration.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveRegistration.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::approveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
    const approveRegistrationForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approveRegistration.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::approveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
        approveRegistrationForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approveRegistration.url(args, options),
            method: 'post',
        })
    
    approveRegistration.form = approveRegistrationForm
/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
export const disapproveRegistration = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapproveRegistration.url(args, options),
    method: 'post',
})

disapproveRegistration.definition = {
    methods: ["post"],
    url: '/admin/registrations/{userId}/disapprove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
disapproveRegistration.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return disapproveRegistration.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
disapproveRegistration.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapproveRegistration.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::disapproveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
    const disapproveRegistrationForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: disapproveRegistration.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::disapproveRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
        disapproveRegistrationForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: disapproveRegistration.url(args, options),
            method: 'post',
        })
    
    disapproveRegistration.form = disapproveRegistrationForm
/**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:238
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
 * @see app/Http/Controllers/Admin/AdminController.php:238
 * @route '/admin/seller-approval'
 */
sellerApproval.url = (options?: RouteQueryOptions) => {
    return sellerApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:238
 * @route '/admin/seller-approval'
 */
sellerApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:238
 * @route '/admin/seller-approval'
 */
sellerApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sellerApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:238
 * @route '/admin/seller-approval'
 */
    const sellerApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sellerApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:238
 * @route '/admin/seller-approval'
 */
        sellerApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::sellerApproval
 * @see app/Http/Controllers/Admin/AdminController.php:238
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
* @see \App\Http\Controllers\Admin\AdminController::getSellerDetails
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
export const getSellerDetails = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSellerDetails.url(args, options),
    method: 'get',
})

getSellerDetails.definition = {
    methods: ["get","head"],
    url: '/admin/seller-approval/{userId}/details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::getSellerDetails
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
getSellerDetails.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return getSellerDetails.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::getSellerDetails
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
getSellerDetails.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSellerDetails.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::getSellerDetails
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
getSellerDetails.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSellerDetails.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::getSellerDetails
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
    const getSellerDetailsForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getSellerDetails.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::getSellerDetails
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
        getSellerDetailsForm.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getSellerDetails.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::getSellerDetails
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
        getSellerDetailsForm.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getSellerDetails.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getSellerDetails.form = getSellerDetailsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:510
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
 * @see app/Http/Controllers/Admin/AdminController.php:510
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
 * @see app/Http/Controllers/Admin/AdminController.php:510
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
downloadDocument.get = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadDocument.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:510
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
downloadDocument.head = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloadDocument.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:510
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
    const downloadDocumentForm = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: downloadDocument.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:510
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
        downloadDocumentForm.get = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: downloadDocument.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:510
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
* @see \App\Http\Controllers\Admin\AdminController::approveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
export const approveSellerRegistration = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveSellerRegistration.url(args, options),
    method: 'post',
})

approveSellerRegistration.definition = {
    methods: ["post"],
    url: '/admin/seller-approval/{userId}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::approveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
approveSellerRegistration.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return approveSellerRegistration.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::approveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
approveSellerRegistration.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveSellerRegistration.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::approveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
    const approveSellerRegistrationForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approveSellerRegistration.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::approveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
        approveSellerRegistrationForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approveSellerRegistration.url(args, options),
            method: 'post',
        })
    
    approveSellerRegistration.form = approveSellerRegistrationForm
/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
export const disapproveSellerRegistration = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapproveSellerRegistration.url(args, options),
    method: 'post',
})

disapproveSellerRegistration.definition = {
    methods: ["post"],
    url: '/admin/seller-approval/{userId}/disapprove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
disapproveSellerRegistration.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return disapproveSellerRegistration.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
disapproveSellerRegistration.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapproveSellerRegistration.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::disapproveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
    const disapproveSellerRegistrationForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: disapproveSellerRegistration.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::disapproveSellerRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
        disapproveSellerRegistrationForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: disapproveSellerRegistration.url(args, options),
            method: 'post',
        })
    
    disapproveSellerRegistration.form = disapproveSellerRegistrationForm
/**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:267
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
 * @see app/Http/Controllers/Admin/AdminController.php:267
 * @route '/admin/logistics-approval'
 */
logisticsApproval.url = (options?: RouteQueryOptions) => {
    return logisticsApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:267
 * @route '/admin/logistics-approval'
 */
logisticsApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logisticsApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:267
 * @route '/admin/logistics-approval'
 */
logisticsApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logisticsApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:267
 * @route '/admin/logistics-approval'
 */
    const logisticsApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: logisticsApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:267
 * @route '/admin/logistics-approval'
 */
        logisticsApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: logisticsApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::logisticsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:267
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
* @see \App\Http\Controllers\Admin\AdminController::getLogisticsDetails
 * @see app/Http/Controllers/Admin/AdminController.php:462
 * @route '/admin/logistics-approval/{userId}/details'
 */
export const getLogisticsDetails = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getLogisticsDetails.url(args, options),
    method: 'get',
})

getLogisticsDetails.definition = {
    methods: ["get","head"],
    url: '/admin/logistics-approval/{userId}/details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::getLogisticsDetails
 * @see app/Http/Controllers/Admin/AdminController.php:462
 * @route '/admin/logistics-approval/{userId}/details'
 */
getLogisticsDetails.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return getLogisticsDetails.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::getLogisticsDetails
 * @see app/Http/Controllers/Admin/AdminController.php:462
 * @route '/admin/logistics-approval/{userId}/details'
 */
getLogisticsDetails.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getLogisticsDetails.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::getLogisticsDetails
 * @see app/Http/Controllers/Admin/AdminController.php:462
 * @route '/admin/logistics-approval/{userId}/details'
 */
getLogisticsDetails.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getLogisticsDetails.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::getLogisticsDetails
 * @see app/Http/Controllers/Admin/AdminController.php:462
 * @route '/admin/logistics-approval/{userId}/details'
 */
    const getLogisticsDetailsForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getLogisticsDetails.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::getLogisticsDetails
 * @see app/Http/Controllers/Admin/AdminController.php:462
 * @route '/admin/logistics-approval/{userId}/details'
 */
        getLogisticsDetailsForm.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getLogisticsDetails.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::getLogisticsDetails
 * @see app/Http/Controllers/Admin/AdminController.php:462
 * @route '/admin/logistics-approval/{userId}/details'
 */
        getLogisticsDetailsForm.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getLogisticsDetails.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getLogisticsDetails.form = getLogisticsDetailsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::approveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:378
 * @route '/admin/logistics-approval/{userId}/approve'
 */
export const approveLogisticsRegistration = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveLogisticsRegistration.url(args, options),
    method: 'post',
})

approveLogisticsRegistration.definition = {
    methods: ["post"],
    url: '/admin/logistics-approval/{userId}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::approveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:378
 * @route '/admin/logistics-approval/{userId}/approve'
 */
approveLogisticsRegistration.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return approveLogisticsRegistration.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::approveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:378
 * @route '/admin/logistics-approval/{userId}/approve'
 */
approveLogisticsRegistration.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveLogisticsRegistration.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::approveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:378
 * @route '/admin/logistics-approval/{userId}/approve'
 */
    const approveLogisticsRegistrationForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approveLogisticsRegistration.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::approveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:378
 * @route '/admin/logistics-approval/{userId}/approve'
 */
        approveLogisticsRegistrationForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approveLogisticsRegistration.url(args, options),
            method: 'post',
        })
    
    approveLogisticsRegistration.form = approveLogisticsRegistrationForm
/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:397
 * @route '/admin/logistics-approval/{userId}/disapprove'
 */
export const disapproveLogisticsRegistration = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapproveLogisticsRegistration.url(args, options),
    method: 'post',
})

disapproveLogisticsRegistration.definition = {
    methods: ["post"],
    url: '/admin/logistics-approval/{userId}/disapprove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:397
 * @route '/admin/logistics-approval/{userId}/disapprove'
 */
disapproveLogisticsRegistration.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return disapproveLogisticsRegistration.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::disapproveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:397
 * @route '/admin/logistics-approval/{userId}/disapprove'
 */
disapproveLogisticsRegistration.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapproveLogisticsRegistration.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::disapproveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:397
 * @route '/admin/logistics-approval/{userId}/disapprove'
 */
    const disapproveLogisticsRegistrationForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: disapproveLogisticsRegistration.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::disapproveLogisticsRegistration
 * @see app/Http/Controllers/Admin/AdminController.php:397
 * @route '/admin/logistics-approval/{userId}/disapprove'
 */
        disapproveLogisticsRegistrationForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: disapproveLogisticsRegistration.url(args, options),
            method: 'post',
        })
    
    disapproveLogisticsRegistration.form = disapproveLogisticsRegistrationForm
/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:294
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
 * @see app/Http/Controllers/Admin/AdminController.php:294
 * @route '/admin/product-approval'
 */
productApproval.url = (options?: RouteQueryOptions) => {
    return productApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:294
 * @route '/admin/product-approval'
 */
productApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:294
 * @route '/admin/product-approval'
 */
productApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: productApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:294
 * @route '/admin/product-approval'
 */
    const productApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: productApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:294
 * @route '/admin/product-approval'
 */
        productApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:294
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
* @see \App\Http\Controllers\Admin\AdminController::productReports
 * @see app/Http/Controllers/Admin/AdminController.php:302
 * @route '/admin/reports'
 */
export const productReports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productReports.url(options),
    method: 'get',
})

productReports.definition = {
    methods: ["get","head"],
    url: '/admin/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::productReports
 * @see app/Http/Controllers/Admin/AdminController.php:302
 * @route '/admin/reports'
 */
productReports.url = (options?: RouteQueryOptions) => {
    return productReports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::productReports
 * @see app/Http/Controllers/Admin/AdminController.php:302
 * @route '/admin/reports'
 */
productReports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productReports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::productReports
 * @see app/Http/Controllers/Admin/AdminController.php:302
 * @route '/admin/reports'
 */
productReports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: productReports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::productReports
 * @see app/Http/Controllers/Admin/AdminController.php:302
 * @route '/admin/reports'
 */
    const productReportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: productReports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::productReports
 * @see app/Http/Controllers/Admin/AdminController.php:302
 * @route '/admin/reports'
 */
        productReportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productReports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::productReports
 * @see app/Http/Controllers/Admin/AdminController.php:302
 * @route '/admin/reports'
 */
        productReportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productReports.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    productReports.form = productReportsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:532
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
 * @see app/Http/Controllers/Admin/AdminController.php:532
 * @route '/admin/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:532
 * @route '/admin/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:532
 * @route '/admin/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:532
 * @route '/admin/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
const AdminController = { index, verify, dashboard, manageRegistrations, approveRegistration, disapproveRegistration, sellerApproval, getSellerDetails, downloadDocument, approveSellerRegistration, disapproveSellerRegistration, logisticsApproval, getLogisticsDetails, approveLogisticsRegistration, disapproveLogisticsRegistration, productApproval, productReports, logout }

export default AdminController