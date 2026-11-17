import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::index
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/platform-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::index
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::index
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::index
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::index
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::index
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::index
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:21
 * @route '/admin/platform-settings'
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
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements'
 */
const saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.url(options),
    method: 'post',
})

saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.definition = {
    methods: ["post"],
    url: '/admin/platform-settings/announcements',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements'
 */
saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.url = (options?: RouteQueryOptions) => {
    return saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements'
 */
saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements'
 */
    const saveAnnouncementd8bffe1decceb4e6ed2954a097de4dcaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements'
 */
        saveAnnouncementd8bffe1decceb4e6ed2954a097de4dcaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.url(options),
            method: 'post',
        })
    
    saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca.form = saveAnnouncementd8bffe1decceb4e6ed2954a097de4dcaForm
    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements/{id}'
 */
const saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.url(args, options),
    method: 'put',
})

saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.definition = {
    methods: ["put"],
    url: '/admin/platform-settings/announcements/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements/{id}'
 */
saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements/{id}'
 */
saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements/{id}'
 */
    const saveAnnouncement2c2facd5b5d6cc74c361deae25d387aaForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:52
 * @route '/admin/platform-settings/announcements/{id}'
 */
        saveAnnouncement2c2facd5b5d6cc74c361deae25d387aaForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa.form = saveAnnouncement2c2facd5b5d6cc74c361deae25d387aaForm

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\PlatformSettingsController::saveAnnouncement, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `saveAnnouncement['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const saveAnnouncement = {
    '/admin/platform-settings/announcements': saveAnnouncementd8bffe1decceb4e6ed2954a097de4dca,
    '/admin/platform-settings/announcements/{id}': saveAnnouncement2c2facd5b5d6cc74c361deae25d387aa,
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::publishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:66
 * @route '/admin/platform-settings/announcements/{id}/publish'
 */
export const publishAnnouncement = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publishAnnouncement.url(args, options),
    method: 'post',
})

publishAnnouncement.definition = {
    methods: ["post"],
    url: '/admin/platform-settings/announcements/{id}/publish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::publishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:66
 * @route '/admin/platform-settings/announcements/{id}/publish'
 */
publishAnnouncement.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return publishAnnouncement.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::publishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:66
 * @route '/admin/platform-settings/announcements/{id}/publish'
 */
publishAnnouncement.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publishAnnouncement.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::publishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:66
 * @route '/admin/platform-settings/announcements/{id}/publish'
 */
    const publishAnnouncementForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: publishAnnouncement.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::publishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:66
 * @route '/admin/platform-settings/announcements/{id}/publish'
 */
        publishAnnouncementForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: publishAnnouncement.url(args, options),
            method: 'post',
        })
    
    publishAnnouncement.form = publishAnnouncementForm
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::unpublishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:87
 * @route '/admin/platform-settings/announcements/{id}/unpublish'
 */
export const unpublishAnnouncement = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpublishAnnouncement.url(args, options),
    method: 'post',
})

unpublishAnnouncement.definition = {
    methods: ["post"],
    url: '/admin/platform-settings/announcements/{id}/unpublish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::unpublishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:87
 * @route '/admin/platform-settings/announcements/{id}/unpublish'
 */
unpublishAnnouncement.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unpublishAnnouncement.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::unpublishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:87
 * @route '/admin/platform-settings/announcements/{id}/unpublish'
 */
unpublishAnnouncement.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpublishAnnouncement.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::unpublishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:87
 * @route '/admin/platform-settings/announcements/{id}/unpublish'
 */
    const unpublishAnnouncementForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unpublishAnnouncement.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::unpublishAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:87
 * @route '/admin/platform-settings/announcements/{id}/unpublish'
 */
        unpublishAnnouncementForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unpublishAnnouncement.url(args, options),
            method: 'post',
        })
    
    unpublishAnnouncement.form = unpublishAnnouncementForm
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::deleteAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:94
 * @route '/admin/platform-settings/announcements/{id}'
 */
export const deleteAnnouncement = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAnnouncement.url(args, options),
    method: 'delete',
})

deleteAnnouncement.definition = {
    methods: ["delete"],
    url: '/admin/platform-settings/announcements/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::deleteAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:94
 * @route '/admin/platform-settings/announcements/{id}'
 */
deleteAnnouncement.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteAnnouncement.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::deleteAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:94
 * @route '/admin/platform-settings/announcements/{id}'
 */
deleteAnnouncement.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAnnouncement.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::deleteAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:94
 * @route '/admin/platform-settings/announcements/{id}'
 */
    const deleteAnnouncementForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteAnnouncement.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::deleteAnnouncement
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:94
 * @route '/admin/platform-settings/announcements/{id}'
 */
        deleteAnnouncementForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteAnnouncement.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteAnnouncement.form = deleteAnnouncementForm
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::savePolicy
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:103
 * @route '/admin/platform-settings/policies'
 */
export const savePolicy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: savePolicy.url(options),
    method: 'post',
})

savePolicy.definition = {
    methods: ["post"],
    url: '/admin/platform-settings/policies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::savePolicy
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:103
 * @route '/admin/platform-settings/policies'
 */
savePolicy.url = (options?: RouteQueryOptions) => {
    return savePolicy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::savePolicy
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:103
 * @route '/admin/platform-settings/policies'
 */
savePolicy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: savePolicy.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::savePolicy
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:103
 * @route '/admin/platform-settings/policies'
 */
    const savePolicyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: savePolicy.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::savePolicy
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:103
 * @route '/admin/platform-settings/policies'
 */
        savePolicyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: savePolicy.url(options),
            method: 'post',
        })
    
    savePolicy.form = savePolicyForm
/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveKeywords
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:127
 * @route '/admin/platform-settings/keywords'
 */
export const saveKeywords = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveKeywords.url(options),
    method: 'post',
})

saveKeywords.definition = {
    methods: ["post"],
    url: '/admin/platform-settings/keywords',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveKeywords
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:127
 * @route '/admin/platform-settings/keywords'
 */
saveKeywords.url = (options?: RouteQueryOptions) => {
    return saveKeywords.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveKeywords
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:127
 * @route '/admin/platform-settings/keywords'
 */
saveKeywords.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveKeywords.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveKeywords
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:127
 * @route '/admin/platform-settings/keywords'
 */
    const saveKeywordsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: saveKeywords.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PlatformSettingsController::saveKeywords
 * @see app/Http/Controllers/Admin/PlatformSettingsController.php:127
 * @route '/admin/platform-settings/keywords'
 */
        saveKeywordsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: saveKeywords.url(options),
            method: 'post',
        })
    
    saveKeywords.form = saveKeywordsForm
const PlatformSettingsController = { index, saveAnnouncement, publishAnnouncement, unpublishAnnouncement, deleteAnnouncement, savePolicy, saveKeywords }

export default PlatformSettingsController