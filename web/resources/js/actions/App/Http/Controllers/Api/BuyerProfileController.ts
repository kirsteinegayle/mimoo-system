import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
const showbba90c7055ede149fa7ee062eeafd6cc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showbba90c7055ede149fa7ee062eeafd6cc.url(options),
    method: 'get',
})

showbba90c7055ede149fa7ee062eeafd6cc.definition = {
    methods: ["get","head"],
    url: '/api/buyer/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
showbba90c7055ede149fa7ee062eeafd6cc.url = (options?: RouteQueryOptions) => {
    return showbba90c7055ede149fa7ee062eeafd6cc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
showbba90c7055ede149fa7ee062eeafd6cc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showbba90c7055ede149fa7ee062eeafd6cc.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
showbba90c7055ede149fa7ee062eeafd6cc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showbba90c7055ede149fa7ee062eeafd6cc.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
    const showbba90c7055ede149fa7ee062eeafd6ccForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showbba90c7055ede149fa7ee062eeafd6cc.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
        showbba90c7055ede149fa7ee062eeafd6ccForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showbba90c7055ede149fa7ee062eeafd6cc.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/api/buyer/profile'
 */
        showbba90c7055ede149fa7ee062eeafd6ccForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showbba90c7055ede149fa7ee062eeafd6cc.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showbba90c7055ede149fa7ee062eeafd6cc.form = showbba90c7055ede149fa7ee062eeafd6ccForm
    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/buyer/profile'
 */
const show3deaf4a649357b3d215ce1ba2b3927e5 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show3deaf4a649357b3d215ce1ba2b3927e5.url(options),
    method: 'get',
})

show3deaf4a649357b3d215ce1ba2b3927e5.definition = {
    methods: ["get","head"],
    url: '/buyer/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/buyer/profile'
 */
show3deaf4a649357b3d215ce1ba2b3927e5.url = (options?: RouteQueryOptions) => {
    return show3deaf4a649357b3d215ce1ba2b3927e5.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/buyer/profile'
 */
show3deaf4a649357b3d215ce1ba2b3927e5.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show3deaf4a649357b3d215ce1ba2b3927e5.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/buyer/profile'
 */
show3deaf4a649357b3d215ce1ba2b3927e5.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show3deaf4a649357b3d215ce1ba2b3927e5.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/buyer/profile'
 */
    const show3deaf4a649357b3d215ce1ba2b3927e5Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show3deaf4a649357b3d215ce1ba2b3927e5.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/buyer/profile'
 */
        show3deaf4a649357b3d215ce1ba2b3927e5Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show3deaf4a649357b3d215ce1ba2b3927e5.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerProfileController::show
 * @see app/Http/Controllers/Api/BuyerProfileController.php:85
 * @route '/buyer/profile'
 */
        show3deaf4a649357b3d215ce1ba2b3927e5Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show3deaf4a649357b3d215ce1ba2b3927e5.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show3deaf4a649357b3d215ce1ba2b3927e5.form = show3deaf4a649357b3d215ce1ba2b3927e5Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerProfileController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/buyer/profile': showbba90c7055ede149fa7ee062eeafd6cc,
    '/buyer/profile': show3deaf4a649357b3d215ce1ba2b3927e5,
}

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
const updatebba90c7055ede149fa7ee062eeafd6cc = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatebba90c7055ede149fa7ee062eeafd6cc.url(options),
    method: 'put',
})

updatebba90c7055ede149fa7ee062eeafd6cc.definition = {
    methods: ["put"],
    url: '/api/buyer/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
updatebba90c7055ede149fa7ee062eeafd6cc.url = (options?: RouteQueryOptions) => {
    return updatebba90c7055ede149fa7ee062eeafd6cc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
updatebba90c7055ede149fa7ee062eeafd6cc.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatebba90c7055ede149fa7ee062eeafd6cc.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/api/buyer/profile'
 */
    const updatebba90c7055ede149fa7ee062eeafd6ccForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatebba90c7055ede149fa7ee062eeafd6cc.url({
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
        updatebba90c7055ede149fa7ee062eeafd6ccForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatebba90c7055ede149fa7ee062eeafd6cc.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatebba90c7055ede149fa7ee062eeafd6cc.form = updatebba90c7055ede149fa7ee062eeafd6ccForm
    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/buyer/profile'
 */
const update3deaf4a649357b3d215ce1ba2b3927e5 = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update3deaf4a649357b3d215ce1ba2b3927e5.url(options),
    method: 'put',
})

update3deaf4a649357b3d215ce1ba2b3927e5.definition = {
    methods: ["put"],
    url: '/buyer/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/buyer/profile'
 */
update3deaf4a649357b3d215ce1ba2b3927e5.url = (options?: RouteQueryOptions) => {
    return update3deaf4a649357b3d215ce1ba2b3927e5.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/buyer/profile'
 */
update3deaf4a649357b3d215ce1ba2b3927e5.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update3deaf4a649357b3d215ce1ba2b3927e5.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BuyerProfileController::update
 * @see app/Http/Controllers/Api/BuyerProfileController.php:102
 * @route '/buyer/profile'
 */
    const update3deaf4a649357b3d215ce1ba2b3927e5Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update3deaf4a649357b3d215ce1ba2b3927e5.url({
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
 * @route '/buyer/profile'
 */
        update3deaf4a649357b3d215ce1ba2b3927e5Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update3deaf4a649357b3d215ce1ba2b3927e5.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update3deaf4a649357b3d215ce1ba2b3927e5.form = update3deaf4a649357b3d215ce1ba2b3927e5Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerProfileController::update, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `update['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const update = {
    '/api/buyer/profile': updatebba90c7055ede149fa7ee062eeafd6cc,
    '/buyer/profile': update3deaf4a649357b3d215ce1ba2b3927e5,
}

const BuyerProfileController = { show, update }

export default BuyerProfileController