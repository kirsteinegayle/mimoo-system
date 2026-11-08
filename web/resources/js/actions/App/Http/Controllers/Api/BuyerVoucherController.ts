import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/vouchers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
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
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:95
 * @route '/api/buyer/vouchers/claim'
 */
export const claim = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claim.url(options),
    method: 'post',
})

claim.definition = {
    methods: ["post"],
    url: '/api/buyer/vouchers/claim',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:95
 * @route '/api/buyer/vouchers/claim'
 */
claim.url = (options?: RouteQueryOptions) => {
    return claim.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:95
 * @route '/api/buyer/vouchers/claim'
 */
claim.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claim.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:95
 * @route '/api/buyer/vouchers/claim'
 */
    const claimForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: claim.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:95
 * @route '/api/buyer/vouchers/claim'
 */
        claimForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: claim.url(options),
            method: 'post',
        })
    
    claim.form = claimForm
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:187
 * @route '/api/buyer/vouchers/mine'
 */
export const mine = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mine.url(options),
    method: 'get',
})

mine.definition = {
    methods: ["get","head"],
    url: '/api/buyer/vouchers/mine',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:187
 * @route '/api/buyer/vouchers/mine'
 */
mine.url = (options?: RouteQueryOptions) => {
    return mine.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:187
 * @route '/api/buyer/vouchers/mine'
 */
mine.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mine.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:187
 * @route '/api/buyer/vouchers/mine'
 */
mine.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mine.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:187
 * @route '/api/buyer/vouchers/mine'
 */
    const mineForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: mine.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:187
 * @route '/api/buyer/vouchers/mine'
 */
        mineForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: mine.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:187
 * @route '/api/buyer/vouchers/mine'
 */
        mineForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: mine.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    mine.form = mineForm
const BuyerVoucherController = { index, claim, mine }

export default BuyerVoucherController