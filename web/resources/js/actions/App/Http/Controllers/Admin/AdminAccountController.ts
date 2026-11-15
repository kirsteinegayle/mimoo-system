import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::notificationsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
export const notificationsPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notificationsPage.url(options),
    method: 'get',
})

notificationsPage.definition = {
    methods: ["get","head"],
    url: '/admin/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::notificationsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
notificationsPage.url = (options?: RouteQueryOptions) => {
    return notificationsPage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::notificationsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
notificationsPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notificationsPage.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::notificationsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
notificationsPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notificationsPage.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::notificationsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
    const notificationsPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notificationsPage.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::notificationsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
        notificationsPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notificationsPage.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::notificationsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:39
 * @route '/admin/notifications'
 */
        notificationsPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notificationsPage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notificationsPage.form = notificationsPageForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::feed
 * @see app/Http/Controllers/Admin/AdminAccountController.php:44
 * @route '/admin/notifications/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/admin/notifications/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::feed
 * @see app/Http/Controllers/Admin/AdminAccountController.php:44
 * @route '/admin/notifications/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::feed
 * @see app/Http/Controllers/Admin/AdminAccountController.php:44
 * @route '/admin/notifications/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::feed
 * @see app/Http/Controllers/Admin/AdminAccountController.php:44
 * @route '/admin/notifications/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::feed
 * @see app/Http/Controllers/Admin/AdminAccountController.php:44
 * @route '/admin/notifications/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::feed
 * @see app/Http/Controllers/Admin/AdminAccountController.php:44
 * @route '/admin/notifications/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::feed
 * @see app/Http/Controllers/Admin/AdminAccountController.php:44
 * @route '/admin/notifications/feed'
 */
        feedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    feed.form = feedForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::unreadCount
 * @see app/Http/Controllers/Admin/AdminAccountController.php:73
 * @route '/admin/notifications/unread-count'
 */
export const unreadCount = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unreadCount.url(options),
    method: 'get',
})

unreadCount.definition = {
    methods: ["get","head"],
    url: '/admin/notifications/unread-count',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::unreadCount
 * @see app/Http/Controllers/Admin/AdminAccountController.php:73
 * @route '/admin/notifications/unread-count'
 */
unreadCount.url = (options?: RouteQueryOptions) => {
    return unreadCount.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::unreadCount
 * @see app/Http/Controllers/Admin/AdminAccountController.php:73
 * @route '/admin/notifications/unread-count'
 */
unreadCount.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unreadCount.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::unreadCount
 * @see app/Http/Controllers/Admin/AdminAccountController.php:73
 * @route '/admin/notifications/unread-count'
 */
unreadCount.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: unreadCount.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::unreadCount
 * @see app/Http/Controllers/Admin/AdminAccountController.php:73
 * @route '/admin/notifications/unread-count'
 */
    const unreadCountForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: unreadCount.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::unreadCount
 * @see app/Http/Controllers/Admin/AdminAccountController.php:73
 * @route '/admin/notifications/unread-count'
 */
        unreadCountForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: unreadCount.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::unreadCount
 * @see app/Http/Controllers/Admin/AdminAccountController.php:73
 * @route '/admin/notifications/unread-count'
 */
        unreadCountForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: unreadCount.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    unreadCount.form = unreadCountForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::markAllRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:94
 * @route '/admin/notifications/read-all'
 */
export const markAllRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

markAllRead.definition = {
    methods: ["post"],
    url: '/admin/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::markAllRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:94
 * @route '/admin/notifications/read-all'
 */
markAllRead.url = (options?: RouteQueryOptions) => {
    return markAllRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::markAllRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:94
 * @route '/admin/notifications/read-all'
 */
markAllRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::markAllRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:94
 * @route '/admin/notifications/read-all'
 */
    const markAllReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAllRead.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::markAllRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:94
 * @route '/admin/notifications/read-all'
 */
        markAllReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAllRead.url(options),
            method: 'post',
        })
    
    markAllRead.form = markAllReadForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::markRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:81
 * @route '/admin/notifications/{id}/read'
 */
export const markRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/admin/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::markRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:81
 * @route '/admin/notifications/{id}/read'
 */
markRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::markRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:81
 * @route '/admin/notifications/{id}/read'
 */
markRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::markRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:81
 * @route '/admin/notifications/{id}/read'
 */
    const markReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::markRead
 * @see app/Http/Controllers/Admin/AdminAccountController.php:81
 * @route '/admin/notifications/{id}/read'
 */
        markReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markRead.url(args, options),
            method: 'post',
        })
    
    markRead.form = markReadForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settingsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
export const settingsPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settingsPage.url(options),
    method: 'get',
})

settingsPage.definition = {
    methods: ["get","head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settingsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
settingsPage.url = (options?: RouteQueryOptions) => {
    return settingsPage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settingsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
settingsPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settingsPage.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::settingsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
settingsPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settingsPage.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::settingsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
    const settingsPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: settingsPage.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::settingsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
        settingsPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settingsPage.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::settingsPage
 * @see app/Http/Controllers/Admin/AdminAccountController.php:103
 * @route '/admin/settings'
 */
        settingsPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settingsPage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    settingsPage.form = settingsPageForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::updateProfile
 * @see app/Http/Controllers/Admin/AdminAccountController.php:114
 * @route '/admin/settings/profile'
 */
export const updateProfile = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateProfile.url(options),
    method: 'post',
})

updateProfile.definition = {
    methods: ["post"],
    url: '/admin/settings/profile',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::updateProfile
 * @see app/Http/Controllers/Admin/AdminAccountController.php:114
 * @route '/admin/settings/profile'
 */
updateProfile.url = (options?: RouteQueryOptions) => {
    return updateProfile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::updateProfile
 * @see app/Http/Controllers/Admin/AdminAccountController.php:114
 * @route '/admin/settings/profile'
 */
updateProfile.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateProfile.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::updateProfile
 * @see app/Http/Controllers/Admin/AdminAccountController.php:114
 * @route '/admin/settings/profile'
 */
    const updateProfileForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateProfile.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::updateProfile
 * @see app/Http/Controllers/Admin/AdminAccountController.php:114
 * @route '/admin/settings/profile'
 */
        updateProfileForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateProfile.url(options),
            method: 'post',
        })
    
    updateProfile.form = updateProfileForm
/**
* @see \App\Http\Controllers\Admin\AdminAccountController::updatePassword
 * @see app/Http/Controllers/Admin/AdminAccountController.php:130
 * @route '/admin/settings/password'
 */
export const updatePassword = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updatePassword.url(options),
    method: 'post',
})

updatePassword.definition = {
    methods: ["post"],
    url: '/admin/settings/password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::updatePassword
 * @see app/Http/Controllers/Admin/AdminAccountController.php:130
 * @route '/admin/settings/password'
 */
updatePassword.url = (options?: RouteQueryOptions) => {
    return updatePassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAccountController::updatePassword
 * @see app/Http/Controllers/Admin/AdminAccountController.php:130
 * @route '/admin/settings/password'
 */
updatePassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updatePassword.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAccountController::updatePassword
 * @see app/Http/Controllers/Admin/AdminAccountController.php:130
 * @route '/admin/settings/password'
 */
    const updatePasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePassword.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAccountController::updatePassword
 * @see app/Http/Controllers/Admin/AdminAccountController.php:130
 * @route '/admin/settings/password'
 */
        updatePasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatePassword.url(options),
            method: 'post',
        })
    
    updatePassword.form = updatePasswordForm
const AdminAccountController = { notificationsPage, feed, unreadCount, markAllRead, markRead, settingsPage, updateProfile, updatePassword }

export default AdminAccountController