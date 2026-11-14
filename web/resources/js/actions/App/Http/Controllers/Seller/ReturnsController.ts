import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Seller\ReturnsController::page
 * @see app/Http/Controllers/Seller/ReturnsController.php:39
 * @route '/seller/returns'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/seller/returns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Seller\ReturnsController::page
 * @see app/Http/Controllers/Seller/ReturnsController.php:39
 * @route '/seller/returns'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Seller\ReturnsController::page
 * @see app/Http/Controllers/Seller/ReturnsController.php:39
 * @route '/seller/returns'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Seller\ReturnsController::page
 * @see app/Http/Controllers/Seller/ReturnsController.php:39
 * @route '/seller/returns'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Seller\ReturnsController::page
 * @see app/Http/Controllers/Seller/ReturnsController.php:39
 * @route '/seller/returns'
 */
    const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Seller\ReturnsController::page
 * @see app/Http/Controllers/Seller/ReturnsController.php:39
 * @route '/seller/returns'
 */
        pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Seller\ReturnsController::page
 * @see app/Http/Controllers/Seller/ReturnsController.php:39
 * @route '/seller/returns'
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
* @see \App\Http\Controllers\Seller\ReturnsController::feed
 * @see app/Http/Controllers/Seller/ReturnsController.php:46
 * @route '/seller/returns/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/seller/returns/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Seller\ReturnsController::feed
 * @see app/Http/Controllers/Seller/ReturnsController.php:46
 * @route '/seller/returns/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Seller\ReturnsController::feed
 * @see app/Http/Controllers/Seller/ReturnsController.php:46
 * @route '/seller/returns/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Seller\ReturnsController::feed
 * @see app/Http/Controllers/Seller/ReturnsController.php:46
 * @route '/seller/returns/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Seller\ReturnsController::feed
 * @see app/Http/Controllers/Seller/ReturnsController.php:46
 * @route '/seller/returns/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Seller\ReturnsController::feed
 * @see app/Http/Controllers/Seller/ReturnsController.php:46
 * @route '/seller/returns/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Seller\ReturnsController::feed
 * @see app/Http/Controllers/Seller/ReturnsController.php:46
 * @route '/seller/returns/feed'
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
* @see \App\Http\Controllers\Seller\ReturnsController::decision
 * @see app/Http/Controllers/Seller/ReturnsController.php:90
 * @route '/seller/returns/{id}/decision'
 */
export const decision = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decision.url(args, options),
    method: 'post',
})

decision.definition = {
    methods: ["post"],
    url: '/seller/returns/{id}/decision',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Seller\ReturnsController::decision
 * @see app/Http/Controllers/Seller/ReturnsController.php:90
 * @route '/seller/returns/{id}/decision'
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
* @see \App\Http\Controllers\Seller\ReturnsController::decision
 * @see app/Http/Controllers/Seller/ReturnsController.php:90
 * @route '/seller/returns/{id}/decision'
 */
decision.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decision.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Seller\ReturnsController::decision
 * @see app/Http/Controllers/Seller/ReturnsController.php:90
 * @route '/seller/returns/{id}/decision'
 */
    const decisionForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decision.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Seller\ReturnsController::decision
 * @see app/Http/Controllers/Seller/ReturnsController.php:90
 * @route '/seller/returns/{id}/decision'
 */
        decisionForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decision.url(args, options),
            method: 'post',
        })
    
    decision.form = decisionForm
/**
* @see \App\Http\Controllers\Seller\ReturnsController::photo
 * @see app/Http/Controllers/Seller/ReturnsController.php:111
 * @route '/seller/returns/{id}/photo/{filename}'
 */
export const photo = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})

photo.definition = {
    methods: ["get","head"],
    url: '/seller/returns/{id}/photo/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Seller\ReturnsController::photo
 * @see app/Http/Controllers/Seller/ReturnsController.php:111
 * @route '/seller/returns/{id}/photo/{filename}'
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
* @see \App\Http\Controllers\Seller\ReturnsController::photo
 * @see app/Http/Controllers/Seller/ReturnsController.php:111
 * @route '/seller/returns/{id}/photo/{filename}'
 */
photo.get = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Seller\ReturnsController::photo
 * @see app/Http/Controllers/Seller/ReturnsController.php:111
 * @route '/seller/returns/{id}/photo/{filename}'
 */
photo.head = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: photo.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Seller\ReturnsController::photo
 * @see app/Http/Controllers/Seller/ReturnsController.php:111
 * @route '/seller/returns/{id}/photo/{filename}'
 */
    const photoForm = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: photo.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Seller\ReturnsController::photo
 * @see app/Http/Controllers/Seller/ReturnsController.php:111
 * @route '/seller/returns/{id}/photo/{filename}'
 */
        photoForm.get = (args: { id: string | number, filename: string | number } | [id: string | number, filename: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: photo.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Seller\ReturnsController::photo
 * @see app/Http/Controllers/Seller/ReturnsController.php:111
 * @route '/seller/returns/{id}/photo/{filename}'
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
const ReturnsController = { page, feed, decision, photo }

export default ReturnsController