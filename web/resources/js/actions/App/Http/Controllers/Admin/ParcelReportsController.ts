import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::page
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/admin/parcel-reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::page
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::page
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::page
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::page
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
    const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::page
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
 */
        pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::page
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:24
 * @route '/admin/parcel-reports'
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
* @see \App\Http\Controllers\Admin\ParcelReportsController::feed
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:29
 * @route '/admin/parcel-reports/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/admin/parcel-reports/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::feed
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:29
 * @route '/admin/parcel-reports/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::feed
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:29
 * @route '/admin/parcel-reports/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::feed
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:29
 * @route '/admin/parcel-reports/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::feed
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:29
 * @route '/admin/parcel-reports/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::feed
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:29
 * @route '/admin/parcel-reports/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::feed
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:29
 * @route '/admin/parcel-reports/feed'
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
* @see \App\Http\Controllers\Admin\ParcelReportsController::status
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:66
 * @route '/admin/parcel-reports/{id}/status'
 */
export const status = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/admin/parcel-reports/{id}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::status
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:66
 * @route '/admin/parcel-reports/{id}/status'
 */
status.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return status.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParcelReportsController::status
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:66
 * @route '/admin/parcel-reports/{id}/status'
 */
status.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::status
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:66
 * @route '/admin/parcel-reports/{id}/status'
 */
    const statusForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ParcelReportsController::status
 * @see app/Http/Controllers/Admin/ParcelReportsController.php:66
 * @route '/admin/parcel-reports/{id}/status'
 */
        statusForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, options),
            method: 'post',
        })
    
    status.form = statusForm
const ParcelReportsController = { page, feed, status }

export default ParcelReportsController