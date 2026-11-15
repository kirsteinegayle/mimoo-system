import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
const indexa2a26d14a5b42d1d598cda199bb9d2d7 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexa2a26d14a5b42d1d598cda199bb9d2d7.url(options),
    method: 'get',
})

indexa2a26d14a5b42d1d598cda199bb9d2d7.definition = {
    methods: ["get","head"],
    url: '/api/buyer/vouchers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
indexa2a26d14a5b42d1d598cda199bb9d2d7.url = (options?: RouteQueryOptions) => {
    return indexa2a26d14a5b42d1d598cda199bb9d2d7.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
indexa2a26d14a5b42d1d598cda199bb9d2d7.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexa2a26d14a5b42d1d598cda199bb9d2d7.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
indexa2a26d14a5b42d1d598cda199bb9d2d7.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexa2a26d14a5b42d1d598cda199bb9d2d7.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
    const indexa2a26d14a5b42d1d598cda199bb9d2d7Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexa2a26d14a5b42d1d598cda199bb9d2d7.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
        indexa2a26d14a5b42d1d598cda199bb9d2d7Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexa2a26d14a5b42d1d598cda199bb9d2d7.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/api/buyer/vouchers'
 */
        indexa2a26d14a5b42d1d598cda199bb9d2d7Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexa2a26d14a5b42d1d598cda199bb9d2d7.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexa2a26d14a5b42d1d598cda199bb9d2d7.form = indexa2a26d14a5b42d1d598cda199bb9d2d7Form
    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/buyer/vouchers'
 */
const index9f1cab5d996ffa8ca5532edaddca9429 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index9f1cab5d996ffa8ca5532edaddca9429.url(options),
    method: 'get',
})

index9f1cab5d996ffa8ca5532edaddca9429.definition = {
    methods: ["get","head"],
    url: '/buyer/vouchers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/buyer/vouchers'
 */
index9f1cab5d996ffa8ca5532edaddca9429.url = (options?: RouteQueryOptions) => {
    return index9f1cab5d996ffa8ca5532edaddca9429.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/buyer/vouchers'
 */
index9f1cab5d996ffa8ca5532edaddca9429.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index9f1cab5d996ffa8ca5532edaddca9429.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/buyer/vouchers'
 */
index9f1cab5d996ffa8ca5532edaddca9429.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index9f1cab5d996ffa8ca5532edaddca9429.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/buyer/vouchers'
 */
    const index9f1cab5d996ffa8ca5532edaddca9429Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index9f1cab5d996ffa8ca5532edaddca9429.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/buyer/vouchers'
 */
        index9f1cab5d996ffa8ca5532edaddca9429Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index9f1cab5d996ffa8ca5532edaddca9429.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::index
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:62
 * @route '/buyer/vouchers'
 */
        index9f1cab5d996ffa8ca5532edaddca9429Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index9f1cab5d996ffa8ca5532edaddca9429.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index9f1cab5d996ffa8ca5532edaddca9429.form = index9f1cab5d996ffa8ca5532edaddca9429Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerVoucherController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/vouchers': indexa2a26d14a5b42d1d598cda199bb9d2d7,
    '/buyer/vouchers': index9f1cab5d996ffa8ca5532edaddca9429,
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/api/buyer/vouchers/claim'
 */
const claimca5af95578a646f913cce29378e7bf6c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claimca5af95578a646f913cce29378e7bf6c.url(options),
    method: 'post',
})

claimca5af95578a646f913cce29378e7bf6c.definition = {
    methods: ["post"],
    url: '/api/buyer/vouchers/claim',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/api/buyer/vouchers/claim'
 */
claimca5af95578a646f913cce29378e7bf6c.url = (options?: RouteQueryOptions) => {
    return claimca5af95578a646f913cce29378e7bf6c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/api/buyer/vouchers/claim'
 */
claimca5af95578a646f913cce29378e7bf6c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claimca5af95578a646f913cce29378e7bf6c.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/api/buyer/vouchers/claim'
 */
    const claimca5af95578a646f913cce29378e7bf6cForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: claimca5af95578a646f913cce29378e7bf6c.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/api/buyer/vouchers/claim'
 */
        claimca5af95578a646f913cce29378e7bf6cForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: claimca5af95578a646f913cce29378e7bf6c.url(options),
            method: 'post',
        })
    
    claimca5af95578a646f913cce29378e7bf6c.form = claimca5af95578a646f913cce29378e7bf6cForm
    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/buyer/vouchers/claim'
 */
const claimd2ab9ae570aa500ce7a0d4108b26cb7d = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claimd2ab9ae570aa500ce7a0d4108b26cb7d.url(options),
    method: 'post',
})

claimd2ab9ae570aa500ce7a0d4108b26cb7d.definition = {
    methods: ["post"],
    url: '/buyer/vouchers/claim',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/buyer/vouchers/claim'
 */
claimd2ab9ae570aa500ce7a0d4108b26cb7d.url = (options?: RouteQueryOptions) => {
    return claimd2ab9ae570aa500ce7a0d4108b26cb7d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/buyer/vouchers/claim'
 */
claimd2ab9ae570aa500ce7a0d4108b26cb7d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claimd2ab9ae570aa500ce7a0d4108b26cb7d.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/buyer/vouchers/claim'
 */
    const claimd2ab9ae570aa500ce7a0d4108b26cb7dForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: claimd2ab9ae570aa500ce7a0d4108b26cb7d.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::claim
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:77
 * @route '/buyer/vouchers/claim'
 */
        claimd2ab9ae570aa500ce7a0d4108b26cb7dForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: claimd2ab9ae570aa500ce7a0d4108b26cb7d.url(options),
            method: 'post',
        })
    
    claimd2ab9ae570aa500ce7a0d4108b26cb7d.form = claimd2ab9ae570aa500ce7a0d4108b26cb7dForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerVoucherController::claim, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `claim['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const claim = {
    '/api/buyer/vouchers/claim': claimca5af95578a646f913cce29378e7bf6c,
    '/buyer/vouchers/claim': claimd2ab9ae570aa500ce7a0d4108b26cb7d,
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/api/buyer/vouchers/mine'
 */
const minedb126f7365fb27e7a1998de76d8aa36a = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: minedb126f7365fb27e7a1998de76d8aa36a.url(options),
    method: 'get',
})

minedb126f7365fb27e7a1998de76d8aa36a.definition = {
    methods: ["get","head"],
    url: '/api/buyer/vouchers/mine',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/api/buyer/vouchers/mine'
 */
minedb126f7365fb27e7a1998de76d8aa36a.url = (options?: RouteQueryOptions) => {
    return minedb126f7365fb27e7a1998de76d8aa36a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/api/buyer/vouchers/mine'
 */
minedb126f7365fb27e7a1998de76d8aa36a.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: minedb126f7365fb27e7a1998de76d8aa36a.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/api/buyer/vouchers/mine'
 */
minedb126f7365fb27e7a1998de76d8aa36a.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: minedb126f7365fb27e7a1998de76d8aa36a.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/api/buyer/vouchers/mine'
 */
    const minedb126f7365fb27e7a1998de76d8aa36aForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: minedb126f7365fb27e7a1998de76d8aa36a.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/api/buyer/vouchers/mine'
 */
        minedb126f7365fb27e7a1998de76d8aa36aForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: minedb126f7365fb27e7a1998de76d8aa36a.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/api/buyer/vouchers/mine'
 */
        minedb126f7365fb27e7a1998de76d8aa36aForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: minedb126f7365fb27e7a1998de76d8aa36a.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    minedb126f7365fb27e7a1998de76d8aa36a.form = minedb126f7365fb27e7a1998de76d8aa36aForm
    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/buyer/vouchers/mine'
 */
const minebb7a39fbb171fcb112198bf793342e73 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: minebb7a39fbb171fcb112198bf793342e73.url(options),
    method: 'get',
})

minebb7a39fbb171fcb112198bf793342e73.definition = {
    methods: ["get","head"],
    url: '/buyer/vouchers/mine',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/buyer/vouchers/mine'
 */
minebb7a39fbb171fcb112198bf793342e73.url = (options?: RouteQueryOptions) => {
    return minebb7a39fbb171fcb112198bf793342e73.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/buyer/vouchers/mine'
 */
minebb7a39fbb171fcb112198bf793342e73.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: minebb7a39fbb171fcb112198bf793342e73.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/buyer/vouchers/mine'
 */
minebb7a39fbb171fcb112198bf793342e73.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: minebb7a39fbb171fcb112198bf793342e73.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/buyer/vouchers/mine'
 */
    const minebb7a39fbb171fcb112198bf793342e73Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: minebb7a39fbb171fcb112198bf793342e73.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/buyer/vouchers/mine'
 */
        minebb7a39fbb171fcb112198bf793342e73Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: minebb7a39fbb171fcb112198bf793342e73.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerVoucherController::mine
 * @see app/Http/Controllers/Api/BuyerVoucherController.php:112
 * @route '/buyer/vouchers/mine'
 */
        minebb7a39fbb171fcb112198bf793342e73Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: minebb7a39fbb171fcb112198bf793342e73.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    minebb7a39fbb171fcb112198bf793342e73.form = minebb7a39fbb171fcb112198bf793342e73Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerVoucherController::mine, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `mine['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const mine = {
    '/api/buyer/vouchers/mine': minedb126f7365fb27e7a1998de76d8aa36a,
    '/buyer/vouchers/mine': minebb7a39fbb171fcb112198bf793342e73,
}

const BuyerVoucherController = { index, claim, mine }

export default BuyerVoucherController