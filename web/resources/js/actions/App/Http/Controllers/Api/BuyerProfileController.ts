import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/buyer/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/buyer/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const BuyerProfileController = { show, update }

export default BuyerProfileController