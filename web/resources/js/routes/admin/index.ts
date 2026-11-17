import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import generateReports0b82f1 from './generate-reports'
import userAccountsB83419 from './user-accounts'
import complaints23c87c from './complaints'
import sellerApprovalDe7003 from './seller-approval'
import logisticsApproval9dc57a from './logistics-approval'
import returns4b8e07 from './returns'
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
 * @see app/Http/Controllers/Admin/AdminController.php:53
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
 * @see app/Http/Controllers/Admin/AdminController.php:53
 * @route '/admin/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:53
 * @route '/admin/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:53
 * @route '/admin/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:53
 * @route '/admin/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:53
 * @route '/admin/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::dashboard
 * @see app/Http/Controllers/Admin/AdminController.php:53
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
 * @see app/Http/Controllers/Admin/VoucherController.php:22
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
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
vouchers.url = (options?: RouteQueryOptions) => {
    return vouchers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
vouchers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vouchers.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
vouchers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vouchers.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
    const vouchersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vouchers.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
        vouchersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vouchers.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\VoucherController::vouchers
 * @see app/Http/Controllers/Admin/VoucherController.php:22
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
* @see \App\Http\Controllers\Admin\BannerController::banners
 * @see app/Http/Controllers/Admin/BannerController.php:28
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
* @see \App\Http\Controllers\Admin\BannerController::banners
 * @see app/Http/Controllers/Admin/BannerController.php:28
 * @route '/admin/banners'
 */
banners.url = (options?: RouteQueryOptions) => {
    return banners.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BannerController::banners
 * @see app/Http/Controllers/Admin/BannerController.php:28
 * @route '/admin/banners'
 */
banners.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: banners.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BannerController::banners
 * @see app/Http/Controllers/Admin/BannerController.php:28
 * @route '/admin/banners'
 */
banners.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: banners.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BannerController::banners
 * @see app/Http/Controllers/Admin/BannerController.php:28
 * @route '/admin/banners'
 */
    const bannersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: banners.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BannerController::banners
 * @see app/Http/Controllers/Admin/BannerController.php:28
 * @route '/admin/banners'
 */
        bannersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: banners.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BannerController::banners
 * @see app/Http/Controllers/Admin/BannerController.php:28
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
* @see \App\Http\Controllers\Admin\AdminReportsController::generateReports
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
export const generateReports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateReports.url(options),
    method: 'get',
})

generateReports.definition = {
    methods: ["get","head"],
    url: '/admin/generate-reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminReportsController::generateReports
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
generateReports.url = (options?: RouteQueryOptions) => {
    return generateReports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReportsController::generateReports
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
generateReports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateReports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminReportsController::generateReports
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
generateReports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generateReports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReportsController::generateReports
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
    const generateReportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: generateReports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReportsController::generateReports
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
        generateReportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: generateReports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminReportsController::generateReports
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
        generateReportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: generateReports.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    generateReports.form = generateReportsForm
/**
 * @see routes/web.php:2386
 * @route '/admin/pending-approval'
 */
export const pendingApproval = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pendingApproval.url(options),
    method: 'get',
})

pendingApproval.definition = {
    methods: ["get","head"],
    url: '/admin/pending-approval',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:2386
 * @route '/admin/pending-approval'
 */
pendingApproval.url = (options?: RouteQueryOptions) => {
    return pendingApproval.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:2386
 * @route '/admin/pending-approval'
 */
pendingApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pendingApproval.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:2386
 * @route '/admin/pending-approval'
 */
pendingApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pendingApproval.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:2386
 * @route '/admin/pending-approval'
 */
    const pendingApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pendingApproval.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:2386
 * @route '/admin/pending-approval'
 */
        pendingApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pendingApproval.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:2386
 * @route '/admin/pending-approval'
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
* @see \App\Http\Controllers\Admin\UserAccountsController::userAccounts
 * @see app/Http/Controllers/Admin/UserAccountsController.php:24
 * @route '/admin/user-accounts'
 */
export const userAccounts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userAccounts.url(options),
    method: 'get',
})

userAccounts.definition = {
    methods: ["get","head"],
    url: '/admin/user-accounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\UserAccountsController::userAccounts
 * @see app/Http/Controllers/Admin/UserAccountsController.php:24
 * @route '/admin/user-accounts'
 */
userAccounts.url = (options?: RouteQueryOptions) => {
    return userAccounts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\UserAccountsController::userAccounts
 * @see app/Http/Controllers/Admin/UserAccountsController.php:24
 * @route '/admin/user-accounts'
 */
userAccounts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userAccounts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\UserAccountsController::userAccounts
 * @see app/Http/Controllers/Admin/UserAccountsController.php:24
 * @route '/admin/user-accounts'
 */
userAccounts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userAccounts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\UserAccountsController::userAccounts
 * @see app/Http/Controllers/Admin/UserAccountsController.php:24
 * @route '/admin/user-accounts'
 */
    const userAccountsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: userAccounts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\UserAccountsController::userAccounts
 * @see app/Http/Controllers/Admin/UserAccountsController.php:24
 * @route '/admin/user-accounts'
 */
        userAccountsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userAccounts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\UserAccountsController::userAccounts
 * @see app/Http/Controllers/Admin/UserAccountsController.php:24
 * @route '/admin/user-accounts'
 */
        userAccountsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userAccounts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    userAccounts.form = userAccountsForm
/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::sellerCompliance
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
export const sellerCompliance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerCompliance.url(options),
    method: 'get',
})

sellerCompliance.definition = {
    methods: ["get","head"],
    url: '/admin/seller-compliance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::sellerCompliance
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
sellerCompliance.url = (options?: RouteQueryOptions) => {
    return sellerCompliance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::sellerCompliance
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
sellerCompliance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerCompliance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SellerComplianceController::sellerCompliance
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
sellerCompliance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sellerCompliance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::sellerCompliance
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
    const sellerComplianceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sellerCompliance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::sellerCompliance
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
        sellerComplianceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerCompliance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SellerComplianceController::sellerCompliance
 * @see app/Http/Controllers/Admin/SellerComplianceController.php:44
 * @route '/admin/seller-compliance'
 */
        sellerComplianceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerCompliance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    sellerCompliance.form = sellerComplianceForm
/**
* @see \App\Http\Controllers\Admin\ComplaintsController::complaints
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
export const complaints = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: complaints.url(options),
    method: 'get',
})

complaints.definition = {
    methods: ["get","head"],
    url: '/admin/complaints',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::complaints
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
complaints.url = (options?: RouteQueryOptions) => {
    return complaints.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ComplaintsController::complaints
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
complaints.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: complaints.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ComplaintsController::complaints
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
complaints.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: complaints.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ComplaintsController::complaints
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
    const complaintsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: complaints.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::complaints
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
        complaintsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: complaints.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ComplaintsController::complaints
 * @see app/Http/Controllers/Admin/ComplaintsController.php:24
 * @route '/admin/complaints'
 */
        complaintsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: complaints.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    complaints.form = complaintsForm
/**
* @see \App\Http\Controllers\Admin\CommissionController::commission
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
export const commission = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: commission.url(options),
    method: 'get',
})

commission.definition = {
    methods: ["get","head"],
    url: '/admin/commission',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CommissionController::commission
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
commission.url = (options?: RouteQueryOptions) => {
    return commission.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CommissionController::commission
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
commission.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: commission.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\CommissionController::commission
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
commission.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: commission.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\CommissionController::commission
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
    const commissionForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: commission.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\CommissionController::commission
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
        commissionForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: commission.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\CommissionController::commission
 * @see app/Http/Controllers/Admin/CommissionController.php:19
 * @route '/admin/commission'
 */
        commissionForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: commission.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    commission.form = commissionForm
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::platformSettings
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
export const platformSettings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: platformSettings.url(options),
    method: 'get',
})

platformSettings.definition = {
    methods: ["get","head"],
    url: '/admin/platform-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::platformSettings
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
platformSettings.url = (options?: RouteQueryOptions) => {
    return platformSettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::platformSettings
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
platformSettings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: platformSettings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::platformSettings
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
platformSettings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: platformSettings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::platformSettings
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
    const platformSettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: platformSettings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::platformSettings
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
        platformSettingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: platformSettings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::platformSettings
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
        platformSettingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: platformSettings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    platformSettings.form = platformSettingsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::accountsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:232
 * @route '/admin/accounts-approval'
 */
export const accountsApproval = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: accountsApproval.url(options),
    method: 'get',
})

accountsApproval.definition = {
    methods: ["get","head"],
    url: '/admin/accounts-approval',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::accountsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:232
 * @route '/admin/accounts-approval'
 */
accountsApproval.url = (options?: RouteQueryOptions) => {
    return accountsApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::accountsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:232
 * @route '/admin/accounts-approval'
 */
accountsApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: accountsApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::accountsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:232
 * @route '/admin/accounts-approval'
 */
accountsApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: accountsApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::accountsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:232
 * @route '/admin/accounts-approval'
 */
    const accountsApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: accountsApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::accountsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:232
 * @route '/admin/accounts-approval'
 */
        accountsApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: accountsApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::accountsApproval
 * @see app/Http/Controllers/Admin/AdminController.php:232
 * @route '/admin/accounts-approval'
 */
        accountsApprovalForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: accountsApproval.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    accountsApproval.form = accountsApprovalForm
/**
 * @see routes/web.php:2422
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
 * @see routes/web.php:2422
 * @route '/admin/seller-approval'
 */
sellerApproval.url = (options?: RouteQueryOptions) => {
    return sellerApproval.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:2422
 * @route '/admin/seller-approval'
 */
sellerApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sellerApproval.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:2422
 * @route '/admin/seller-approval'
 */
sellerApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sellerApproval.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:2422
 * @route '/admin/seller-approval'
 */
    const sellerApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sellerApproval.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:2422
 * @route '/admin/seller-approval'
 */
        sellerApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sellerApproval.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:2422
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
 * @see app/Http/Controllers/Admin/AdminController.php:517
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
 * @see app/Http/Controllers/Admin/AdminController.php:517
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
 * @see app/Http/Controllers/Admin/AdminController.php:517
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
downloadDocument.get = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadDocument.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:517
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
downloadDocument.head = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloadDocument.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:517
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
    const downloadDocumentForm = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: downloadDocument.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:517
 * @route '/admin/seller-approval/{userId}/download/{type}'
 */
        downloadDocumentForm.get = (args: { userId: string | number, type: string | number } | [userId: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: downloadDocument.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::downloadDocument
 * @see app/Http/Controllers/Admin/AdminController.php:517
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
 * @see routes/web.php:2429
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
 * @see routes/web.php:2429
 * @route '/admin/logistics-approval'
 */
logisticsApproval.url = (options?: RouteQueryOptions) => {
    return logisticsApproval.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:2429
 * @route '/admin/logistics-approval'
 */
logisticsApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logisticsApproval.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:2429
 * @route '/admin/logistics-approval'
 */
logisticsApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logisticsApproval.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:2429
 * @route '/admin/logistics-approval'
 */
    const logisticsApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: logisticsApproval.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:2429
 * @route '/admin/logistics-approval'
 */
        logisticsApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: logisticsApproval.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:2429
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
 * @see app/Http/Controllers/Admin/AdminController.php:321
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
 * @see app/Http/Controllers/Admin/AdminController.php:321
 * @route '/admin/product-approval'
 */
productApproval.url = (options?: RouteQueryOptions) => {
    return productApproval.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:321
 * @route '/admin/product-approval'
 */
productApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productApproval.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:321
 * @route '/admin/product-approval'
 */
productApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: productApproval.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:321
 * @route '/admin/product-approval'
 */
    const productApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: productApproval.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:321
 * @route '/admin/product-approval'
 */
        productApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: productApproval.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::productApproval
 * @see app/Http/Controllers/Admin/AdminController.php:321
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
 * @see app/Http/Controllers/Admin/AdminController.php:329
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
 * @see app/Http/Controllers/Admin/AdminController.php:329
 * @route '/admin/reports'
 */
reports.url = (options?: RouteQueryOptions) => {
    return reports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:329
 * @route '/admin/reports'
 */
reports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:329
 * @route '/admin/reports'
 */
reports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:329
 * @route '/admin/reports'
 */
    const reportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:329
 * @route '/admin/reports'
 */
        reportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::reports
 * @see app/Http/Controllers/Admin/AdminController.php:329
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
 * @see routes/web.php:2451
 * @route '/admin/messages'
 */
export const messages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/admin/messages',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:2451
 * @route '/admin/messages'
 */
messages.url = (options?: RouteQueryOptions) => {
    return messages.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:2451
 * @route '/admin/messages'
 */
messages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:2451
 * @route '/admin/messages'
 */
messages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:2451
 * @route '/admin/messages'
 */
    const messagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:2451
 * @route '/admin/messages'
 */
        messagesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:2451
 * @route '/admin/messages'
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
* @see \App\Http\Controllers\Admin\AdminAccountController::notifications
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
export const notifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})

notifications.definition = {
    methods: ["get","head"],
    url: '/admin/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::notifications
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
notifications.url = (options?: RouteQueryOptions) => {
    return notifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::notifications
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
notifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::notifications
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
notifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notifications.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::notifications
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
    const notificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notifications.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::notifications
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
        notificationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::notifications
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
        notificationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notifications.form = notificationsForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settings
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settings
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settings
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settings
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::settings
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
    const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: settings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::settings
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
        settingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::settings
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
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
* @see \App\Http\Controllers\Admin\ParcelReportsController::parcelReports
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
export const parcelReports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: parcelReports.url(options),
    method: 'get',
})

parcelReports.definition = {
    methods: ["get","head"],
    url: '/admin/parcel-reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::parcelReports
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
parcelReports.url = (options?: RouteQueryOptions) => {
    return parcelReports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::parcelReports
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
parcelReports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: parcelReports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::parcelReports
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
parcelReports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: parcelReports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::parcelReports
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
    const parcelReportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: parcelReports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::parcelReports
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
        parcelReportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: parcelReports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::parcelReports
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
        parcelReportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: parcelReports.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    parcelReports.form = parcelReportsForm
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::support
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
export const support = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})

support.definition = {
    methods: ["get","head"],
    url: '/admin/support',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::support
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
support.url = (options?: RouteQueryOptions) => {
    return support.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::support
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
support.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::support
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
support.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: support.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::support
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
    const supportForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: support.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::support
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
        supportForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: support.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::support
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
        supportForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: support.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    support.form = supportForm
/**
* @see \App\Http\Controllers\Admin\ReturnsController::returns
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
export const returns = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: returns.url(options),
    method: 'get',
})

returns.definition = {
    methods: ["get","head"],
    url: '/admin/returns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ReturnsController::returns
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
returns.url = (options?: RouteQueryOptions) => {
    return returns.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ReturnsController::returns
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
returns.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: returns.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ReturnsController::returns
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
returns.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: returns.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ReturnsController::returns
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
    const returnsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: returns.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ReturnsController::returns
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
        returnsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: returns.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ReturnsController::returns
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
        returnsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: returns.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    returns.form = returnsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:528
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
 * @see app/Http/Controllers/Admin/AdminController.php:528
 * @route '/admin/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:528
 * @route '/admin/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:528
 * @route '/admin/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::logout
 * @see app/Http/Controllers/Admin/AdminController.php:528
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
generateReports: Object.assign(generateReports, generateReports0b82f1),
pendingApproval: Object.assign(pendingApproval, pendingApproval),
userAccounts: Object.assign(userAccounts, userAccountsB83419),
sellerCompliance: Object.assign(sellerCompliance, sellerCompliance),
complaints: Object.assign(complaints, complaints23c87c),
commission: Object.assign(commission, commission),
platformSettings: Object.assign(platformSettings, platformSettings),
accountsApproval: Object.assign(accountsApproval, accountsApproval),
sellerApproval: Object.assign(sellerApproval, sellerApprovalDe7003),
downloadDocument: Object.assign(downloadDocument, downloadDocument),
logisticsApproval: Object.assign(logisticsApproval, logisticsApproval9dc57a),
productApproval: Object.assign(productApproval, productApproval),
reports: Object.assign(reports, reports),
messages: Object.assign(messages, messages),
notifications: Object.assign(notifications, notifications),
settings: Object.assign(settings, settings),
parcelReports: Object.assign(parcelReports, parcelReports),
support: Object.assign(support, support),
returns: Object.assign(returns, returns4b8e07),
logout: Object.assign(logout, logout),
}

export default admin