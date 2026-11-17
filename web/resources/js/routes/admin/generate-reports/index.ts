import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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
const generateReports = {
    export: Object.assign(exportMethod, exportMethod),
}

export default generateReports