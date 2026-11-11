import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SellerChatController::index
 * @see app/Http/Controllers/Api/SellerChatController.php:126
 * @route '/seller/chat/threads'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/seller/chat/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SellerChatController::index
 * @see app/Http/Controllers/Api/SellerChatController.php:126
 * @route '/seller/chat/threads'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SellerChatController::index
 * @see app/Http/Controllers/Api/SellerChatController.php:126
 * @route '/seller/chat/threads'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SellerChatController::index
 * @see app/Http/Controllers/Api/SellerChatController.php:126
 * @route '/seller/chat/threads'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\SellerChatController::index
 * @see app/Http/Controllers/Api/SellerChatController.php:126
 * @route '/seller/chat/threads'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\SellerChatController::index
 * @see app/Http/Controllers/Api/SellerChatController.php:126
 * @route '/seller/chat/threads'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\SellerChatController::index
 * @see app/Http/Controllers/Api/SellerChatController.php:126
 * @route '/seller/chat/threads'
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
* @see \App\Http\Controllers\Api\SellerChatController::messages
 * @see app/Http/Controllers/Api/SellerChatController.php:145
 * @route '/seller/chat/{id}/messages'
 */
export const messages = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/seller/chat/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SellerChatController::messages
 * @see app/Http/Controllers/Api/SellerChatController.php:145
 * @route '/seller/chat/{id}/messages'
 */
messages.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messages.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SellerChatController::messages
 * @see app/Http/Controllers/Api/SellerChatController.php:145
 * @route '/seller/chat/{id}/messages'
 */
messages.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SellerChatController::messages
 * @see app/Http/Controllers/Api/SellerChatController.php:145
 * @route '/seller/chat/{id}/messages'
 */
messages.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\SellerChatController::messages
 * @see app/Http/Controllers/Api/SellerChatController.php:145
 * @route '/seller/chat/{id}/messages'
 */
    const messagesForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\SellerChatController::messages
 * @see app/Http/Controllers/Api/SellerChatController.php:145
 * @route '/seller/chat/{id}/messages'
 */
        messagesForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\SellerChatController::messages
 * @see app/Http/Controllers/Api/SellerChatController.php:145
 * @route '/seller/chat/{id}/messages'
 */
        messagesForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messages.form = messagesForm
/**
* @see \App\Http\Controllers\Api\SellerChatController::send
 * @see app/Http/Controllers/Api/SellerChatController.php:174
 * @route '/seller/chat/{id}/messages'
 */
export const send = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/seller/chat/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SellerChatController::send
 * @see app/Http/Controllers/Api/SellerChatController.php:174
 * @route '/seller/chat/{id}/messages'
 */
send.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return send.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SellerChatController::send
 * @see app/Http/Controllers/Api/SellerChatController.php:174
 * @route '/seller/chat/{id}/messages'
 */
send.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\SellerChatController::send
 * @see app/Http/Controllers/Api/SellerChatController.php:174
 * @route '/seller/chat/{id}/messages'
 */
    const sendForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\SellerChatController::send
 * @see app/Http/Controllers/Api/SellerChatController.php:174
 * @route '/seller/chat/{id}/messages'
 */
        sendForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send.url(args, options),
            method: 'post',
        })
    
    send.form = sendForm
/**
* @see \App\Http\Controllers\Api\SellerChatController::markRead
 * @see app/Http/Controllers/Api/SellerChatController.php:219
 * @route '/seller/chat/{id}/read'
 */
export const markRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/seller/chat/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SellerChatController::markRead
 * @see app/Http/Controllers/Api/SellerChatController.php:219
 * @route '/seller/chat/{id}/read'
 */
markRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SellerChatController::markRead
 * @see app/Http/Controllers/Api/SellerChatController.php:219
 * @route '/seller/chat/{id}/read'
 */
markRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\SellerChatController::markRead
 * @see app/Http/Controllers/Api/SellerChatController.php:219
 * @route '/seller/chat/{id}/read'
 */
    const markReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\SellerChatController::markRead
 * @see app/Http/Controllers/Api/SellerChatController.php:219
 * @route '/seller/chat/{id}/read'
 */
        markReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markRead.url(args, options),
            method: 'post',
        })
    
    markRead.form = markReadForm
const SellerChatController = { index, messages, send, markRead }

export default SellerChatController