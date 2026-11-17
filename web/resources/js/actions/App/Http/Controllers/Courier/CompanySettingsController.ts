import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/api/courier-app/company-settings'
 */
const show09c36dbce1f7f50c611adb7a552e8db6 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show09c36dbce1f7f50c611adb7a552e8db6.url(options),
    method: 'get',
})

show09c36dbce1f7f50c611adb7a552e8db6.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/company-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/api/courier-app/company-settings'
 */
show09c36dbce1f7f50c611adb7a552e8db6.url = (options?: RouteQueryOptions) => {
    return show09c36dbce1f7f50c611adb7a552e8db6.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/api/courier-app/company-settings'
 */
show09c36dbce1f7f50c611adb7a552e8db6.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show09c36dbce1f7f50c611adb7a552e8db6.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/api/courier-app/company-settings'
 */
show09c36dbce1f7f50c611adb7a552e8db6.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show09c36dbce1f7f50c611adb7a552e8db6.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/api/courier-app/company-settings'
 */
    const show09c36dbce1f7f50c611adb7a552e8db6Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show09c36dbce1f7f50c611adb7a552e8db6.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/api/courier-app/company-settings'
 */
        show09c36dbce1f7f50c611adb7a552e8db6Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show09c36dbce1f7f50c611adb7a552e8db6.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/api/courier-app/company-settings'
 */
        show09c36dbce1f7f50c611adb7a552e8db6Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show09c36dbce1f7f50c611adb7a552e8db6.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show09c36dbce1f7f50c611adb7a552e8db6.form = show09c36dbce1f7f50c611adb7a552e8db6Form
    /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/courier/company-settings'
 */
const showd881a88614df818127c650bf4bdd2a4f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showd881a88614df818127c650bf4bdd2a4f.url(options),
    method: 'get',
})

showd881a88614df818127c650bf4bdd2a4f.definition = {
    methods: ["get","head"],
    url: '/courier/company-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/courier/company-settings'
 */
showd881a88614df818127c650bf4bdd2a4f.url = (options?: RouteQueryOptions) => {
    return showd881a88614df818127c650bf4bdd2a4f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/courier/company-settings'
 */
showd881a88614df818127c650bf4bdd2a4f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showd881a88614df818127c650bf4bdd2a4f.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/courier/company-settings'
 */
showd881a88614df818127c650bf4bdd2a4f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showd881a88614df818127c650bf4bdd2a4f.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/courier/company-settings'
 */
    const showd881a88614df818127c650bf4bdd2a4fForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showd881a88614df818127c650bf4bdd2a4f.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/courier/company-settings'
 */
        showd881a88614df818127c650bf4bdd2a4fForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showd881a88614df818127c650bf4bdd2a4f.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::show
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:27
 * @route '/courier/company-settings'
 */
        showd881a88614df818127c650bf4bdd2a4fForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showd881a88614df818127c650bf4bdd2a4f.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showd881a88614df818127c650bf4bdd2a4f.form = showd881a88614df818127c650bf4bdd2a4fForm

/**
* Multiple routes resolve to \App\Http\Controllers\Courier\CompanySettingsController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/courier-app/company-settings': show09c36dbce1f7f50c611adb7a552e8db6,
    '/courier/company-settings': showd881a88614df818127c650bf4bdd2a4f,
}

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/api/courier-app/company-settings'
 */
const update09c36dbce1f7f50c611adb7a552e8db6 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update09c36dbce1f7f50c611adb7a552e8db6.url(options),
    method: 'post',
})

update09c36dbce1f7f50c611adb7a552e8db6.definition = {
    methods: ["post"],
    url: '/api/courier-app/company-settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/api/courier-app/company-settings'
 */
update09c36dbce1f7f50c611adb7a552e8db6.url = (options?: RouteQueryOptions) => {
    return update09c36dbce1f7f50c611adb7a552e8db6.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/api/courier-app/company-settings'
 */
update09c36dbce1f7f50c611adb7a552e8db6.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update09c36dbce1f7f50c611adb7a552e8db6.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/api/courier-app/company-settings'
 */
    const update09c36dbce1f7f50c611adb7a552e8db6Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update09c36dbce1f7f50c611adb7a552e8db6.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/api/courier-app/company-settings'
 */
        update09c36dbce1f7f50c611adb7a552e8db6Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update09c36dbce1f7f50c611adb7a552e8db6.url(options),
            method: 'post',
        })
    
    update09c36dbce1f7f50c611adb7a552e8db6.form = update09c36dbce1f7f50c611adb7a552e8db6Form
    /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/courier/company-settings'
 */
const updated881a88614df818127c650bf4bdd2a4f = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updated881a88614df818127c650bf4bdd2a4f.url(options),
    method: 'post',
})

updated881a88614df818127c650bf4bdd2a4f.definition = {
    methods: ["post"],
    url: '/courier/company-settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/courier/company-settings'
 */
updated881a88614df818127c650bf4bdd2a4f.url = (options?: RouteQueryOptions) => {
    return updated881a88614df818127c650bf4bdd2a4f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/courier/company-settings'
 */
updated881a88614df818127c650bf4bdd2a4f.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updated881a88614df818127c650bf4bdd2a4f.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/courier/company-settings'
 */
    const updated881a88614df818127c650bf4bdd2a4fForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updated881a88614df818127c650bf4bdd2a4f.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\CompanySettingsController::update
 * @see app/Http/Controllers/Courier/CompanySettingsController.php:48
 * @route '/courier/company-settings'
 */
        updated881a88614df818127c650bf4bdd2a4fForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updated881a88614df818127c650bf4bdd2a4f.url(options),
            method: 'post',
        })
    
    updated881a88614df818127c650bf4bdd2a4f.form = updated881a88614df818127c650bf4bdd2a4fForm

/**
* Multiple routes resolve to \App\Http\Controllers\Courier\CompanySettingsController::update, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `update['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const update = {
    '/api/courier-app/company-settings': update09c36dbce1f7f50c611adb7a552e8db6,
    '/courier/company-settings': updated881a88614df818127c650bf4bdd2a4f,
}

const CompanySettingsController = { show, update }

export default CompanySettingsController