import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
export const approve = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/registrations/{userId}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
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
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
approve.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
    const approveForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::approve
 * @see app/Http/Controllers/Admin/AdminController.php:310
 * @route '/admin/registrations/{userId}/approve'
 */
        approveForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
export const disapprove = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapprove.url(args, options),
    method: 'post',
})

disapprove.definition = {
    methods: ["post"],
    url: '/admin/registrations/{userId}/disapprove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
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
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
disapprove.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disapprove.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
    const disapproveForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: disapprove.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::disapprove
 * @see app/Http/Controllers/Admin/AdminController.php:325
 * @route '/admin/registrations/{userId}/disapprove'
 */
        disapproveForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: disapprove.url(args, options),
            method: 'post',
        })
    
    disapprove.form = disapproveForm
const registrations = {
    approve: Object.assign(approve, approve),
disapprove: Object.assign(disapprove, disapprove),
}

export default registrations