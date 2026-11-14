import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ReturnsController::page
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/admin/returns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ReturnsController::page
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ReturnsController::page
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ReturnsController::page
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ReturnsController::page
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
    const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ReturnsController::page
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
        pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ReturnsController::page
 * @see app/Http/Controllers/Admin/ReturnsController.php:29
 * @route '/admin/returns'
 */
        pageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    page.form = pageForm
/**
* @see \App\Http\Controllers\Admin\ReturnsController::feed
 * @see app/Http/Controllers/Admin/ReturnsController.php:34
 * @route '/admin/returns/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/admin/returns/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ReturnsController::feed
 * @see app/Http/Controllers/Admin/ReturnsController.php:34
 * @route '/admin/returns/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ReturnsController::feed
 * @see app/Http/Controllers/Admin/ReturnsController.php:34
 * @route '/admin/returns/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ReturnsController::feed
 * @see app/Http/Controllers/Admin/ReturnsController.php:34
 * @route '/admin/returns/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ReturnsController::feed
 * @see app/Http/Controllers/Admin/ReturnsController.php:34
 * @route '/admin/returns/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ReturnsController::feed
 * @see app/Http/Controllers/Admin/ReturnsController.php:34
 * @route '/admin/returns/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ReturnsController::feed
 * @see app/Http/Controllers/Admin/ReturnsController.php:34
 * @route '/admin/returns/feed'
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
* @see \App\Http\Controllers\Admin\ReturnsController::decision
 * @see app/Http/Controllers/Admin/ReturnsController.php:77
 * @route '/admin/returns/{id}/decision'
 */
export const decision = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decision.url(args, options),
    method: 'post',
})

decision.definition = {
    methods: ["post"],
    url: '/admin/returns/{id}/decision',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ReturnsController::decision
 * @see app/Http/Controllers/Admin/ReturnsController.php:77
 * @route '/admin/returns/{id}/decision'
 */
decision.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return decision.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ReturnsController::decision
 * @see app/Http/Controllers/Admin/ReturnsController.php:77
 * @route '/admin/returns/{id}/decision'
 */
decision.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decision.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ReturnsController::decision
 * @see app/Http/Controllers/Admin/ReturnsController.php:77
 * @route '/admin/returns/{id}/decision'
 */
    const decisionForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decision.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ReturnsController::decision
 * @see app/Http/Controllers/Admin/ReturnsController.php:77
 * @route '/admin/returns/{id}/decision'
 */
        decisionForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decision.url(args, options),
            method: 'post',
        })
    
    decision.form = decisionForm
/**
* @see \App\Http\Controllers\Admin\ReturnsController::refund
 * @see app/Http/Controllers/Admin/ReturnsController.php:95
 * @route '/admin/returns/{id}/refund'
 */
export const refund = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refund.url(args, options),
    method: 'post',
})

refund.definition = {
    methods: ["post"],
    url: '/admin/returns/{id}/refund',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ReturnsController::refund
 * @see app/Http/Controllers/Admin/ReturnsController.php:95
 * @route '/admin/returns/{id}/refund'
 */
refund.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return refund.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ReturnsController::refund
 * @see app/Http/Controllers/Admin/ReturnsController.php:95
 * @route '/admin/returns/{id}/refund'
 */
refund.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refund.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ReturnsController::refund
 * @see app/Http/Controllers/Admin/ReturnsController.php:95
 * @route '/admin/returns/{id}/refund'
 */
    const refundForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refund.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ReturnsController::refund
 * @see app/Http/Controllers/Admin/ReturnsController.php:95
 * @route '/admin/returns/{id}/refund'
 */
        refundForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refund.url(args, options),
            method: 'post',
        })
    
    refund.form = refundForm
/**
* @see \App\Http\Controllers\Admin\ReturnsController::photo
 * @see app/Http/Controllers/Admin/ReturnsController.php:114
 * @route '/admin/returns/{id}/photo/{filename}'
 */
export const photo = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})

photo.definition = {
    methods: ["get","head"],
    url: '/admin/returns/{id}/photo/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ReturnsController::photo
 * @see app/Http/Controllers/Admin/ReturnsController.php:114
 * @route '/admin/returns/{id}/photo/{filename}'
 */
photo.url = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                    filename: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                                filename: args.filename,
                }

    return photo.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ReturnsController::photo
 * @see app/Http/Controllers/Admin/ReturnsController.php:114
 * @route '/admin/returns/{id}/photo/{filename}'
 */
photo.get = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ReturnsController::photo
 * @see app/Http/Controllers/Admin/ReturnsController.php:114
 * @route '/admin/returns/{id}/photo/{filename}'
 */
photo.head = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: photo.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ReturnsController::photo
 * @see app/Http/Controllers/Admin/ReturnsController.php:114
 * @route '/admin/returns/{id}/photo/{filename}'
 */
    const photoForm = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: photo.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ReturnsController::photo
 * @see app/Http/Controllers/Admin/ReturnsController.php:114
 * @route '/admin/returns/{id}/photo/{filename}'
 */
        photoForm.get = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: photo.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ReturnsController::photo
 * @see app/Http/Controllers/Admin/ReturnsController.php:114
 * @route '/admin/returns/{id}/photo/{filename}'
 */
        photoForm.head = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: photo.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    photo.form = photoForm
const ReturnsController = { page, feed, decision, refund, photo }

export default ReturnsController