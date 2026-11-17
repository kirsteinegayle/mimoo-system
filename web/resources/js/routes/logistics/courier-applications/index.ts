import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
 * @see routes/web.php:994
 * @route '/logistics/courier-applications/{id}/document/{type}'
 */
export const document = (args: { id: string | number, type: string | number } | [id: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})

document.definition = {
    methods: ["get","head"],
    url: '/logistics/courier-applications/{id}/document/{type}',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:994
 * @route '/logistics/courier-applications/{id}/document/{type}'
 */
document.url = (args: { id: string | number, type: string | number } | [id: string | number, type: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                    type: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                                type: args.type,
                }

    return document.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{type}', parsedArgs.type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see routes/web.php:994
 * @route '/logistics/courier-applications/{id}/document/{type}'
 */
document.get = (args: { id: string | number, type: string | number } | [id: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})
/**
 * @see routes/web.php:994
 * @route '/logistics/courier-applications/{id}/document/{type}'
 */
document.head = (args: { id: string | number, type: string | number } | [id: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: document.url(args, options),
    method: 'head',
})

    /**
 * @see routes/web.php:994
 * @route '/logistics/courier-applications/{id}/document/{type}'
 */
    const documentForm = (args: { id: string | number, type: string | number } | [id: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: document.url(args, options),
        method: 'get',
    })

            /**
 * @see routes/web.php:994
 * @route '/logistics/courier-applications/{id}/document/{type}'
 */
        documentForm.get = (args: { id: string | number, type: string | number } | [id: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: document.url(args, options),
            method: 'get',
        })
            /**
 * @see routes/web.php:994
 * @route '/logistics/courier-applications/{id}/document/{type}'
 */
        documentForm.head = (args: { id: string | number, type: string | number } | [id: string | number, type: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: document.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    document.form = documentForm
const courierApplications = {
    document: Object.assign(document, document),
}

export default courierApplications