import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::details
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
export const details = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})

details.definition = {
    methods: ["get","head"],
    url: '/admin/seller-approval/{userId}/details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::details
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
details.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return details.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::details
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
details.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::details
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
details.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: details.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::details
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
    const detailsForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: details.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::details
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
        detailsForm.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: details.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::details
 * @see app/Http/Controllers/Admin/AdminController.php:416
 * @route '/admin/seller-approval/{userId}/details'
 */
        detailsForm.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: details.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    details.form = detailsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
export const approve = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/seller-approval/{userId}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
approve.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
approve.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
    const approveForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:340
 * @route '/admin/seller-approval/{userId}/approve'
 */
        approveForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
export const disapprove = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapprove.url(args, options),
    method: 'post',
})

disapprove.definition = {
    methods: ["post"],
    url: '/admin/seller-approval/{userId}/disapprove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
disapprove.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return disapprove.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
disapprove.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapprove.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
    const disapproveForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: disapprove.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:359
 * @route '/admin/seller-approval/{userId}/disapprove'
 */
        disapproveForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: disapprove.url(args, options),
            method: 'post',
        })
    
    disapprove.form = disapproveForm
const sellerApproval = {
    details: Object.assign(details, details),
approve: Object.assign(approve, approve),
disapprove: Object.assign(disapprove, disapprove),
}

export default sellerApproval