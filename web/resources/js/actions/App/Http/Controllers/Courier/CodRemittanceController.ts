import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/courier/cod-remittances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
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
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
export const confirm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(args, options),
    method: 'post',
})

confirm.definition = {
    methods: ["post"],
    url: '/courier/cod-remittances/{id}/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
confirm.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return confirm.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
confirm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
    const confirmForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: confirm.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
        confirmForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: confirm.url(args, options),
            method: 'post',
        })
    
    confirm.form = confirmForm
const CodRemittanceController = { index, confirm }

export default CodRemittanceController