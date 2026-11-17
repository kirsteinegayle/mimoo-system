import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminReportsController::page
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/admin/generate-reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminReportsController::page
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReportsController::page
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminReportsController::page
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReportsController::page
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
    const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReportsController::page
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
 */
        pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminReportsController::page
 * @see app/Http/Controllers/Admin/AdminReportsController.php:21
 * @route '/admin/generate-reports'
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
* @see \App\Http\Controllers\Admin\AdminReportsController::exportMethod
 * @see app/Http/Controllers/Admin/AdminReportsController.php:35
 * @route '/admin/generate-reports/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/admin/generate-reports/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminReportsController::exportMethod
 * @see app/Http/Controllers/Admin/AdminReportsController.php:35
 * @route '/admin/generate-reports/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReportsController::exportMethod
 * @see app/Http/Controllers/Admin/AdminReportsController.php:35
 * @route '/admin/generate-reports/export'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminReportsController::exportMethod
 * @see app/Http/Controllers/Admin/AdminReportsController.php:35
 * @route '/admin/generate-reports/export'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReportsController::exportMethod
 * @see app/Http/Controllers/Admin/AdminReportsController.php:35
 * @route '/admin/generate-reports/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReportsController::exportMethod
 * @see app/Http/Controllers/Admin/AdminReportsController.php:35
 * @route '/admin/generate-reports/export'
 */
        exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminReportsController::exportMethod
 * @see app/Http/Controllers/Admin/AdminReportsController.php:35
 * @route '/admin/generate-reports/export'
 */
        exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
const AdminReportsController = { page, exportMethod, export: exportMethod }

export default AdminReportsController