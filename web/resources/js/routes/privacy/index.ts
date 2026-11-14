import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:1620
 * @route '/privacy-policy'
 */
export const policy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: policy.url(options),
    method: 'get',
})

policy.definition = {
    methods: ["get","head"],
    url: '/privacy-policy',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1620
 * @route '/privacy-policy'
 */
policy.url = (options?: RouteQueryOptions) => {
    return policy.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1620
 * @route '/privacy-policy'
 */
policy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: policy.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1620
 * @route '/privacy-policy'
 */
policy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: policy.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1620
 * @route '/privacy-policy'
 */
    const policyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: policy.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1620
 * @route '/privacy-policy'
 */
        policyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: policy.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1620
 * @route '/privacy-policy'
 */
        policyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: policy.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    policy.form = policyForm
const privacy = {
    policy: Object.assign(policy, policy),
}

export default privacy