import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:241
 * @route '/api/buyer/chat-image/{filename}'
 */
export const serveImage = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serveImage.url(args, options),
    method: 'get',
})

serveImage.definition = {
    methods: ["get","head"],
    url: '/api/buyer/chat-image/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:241
 * @route '/api/buyer/chat-image/{filename}'
 */
serveImage.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return serveImage.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:241
 * @route '/api/buyer/chat-image/{filename}'
 */
serveImage.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serveImage.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:241
 * @route '/api/buyer/chat-image/{filename}'
 */
serveImage.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: serveImage.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:241
 * @route '/api/buyer/chat-image/{filename}'
 */
    const serveImageForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: serveImage.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:241
 * @route '/api/buyer/chat-image/{filename}'
 */
        serveImageForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: serveImage.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:241
 * @route '/api/buyer/chat-image/{filename}'
 */
        serveImageForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: serveImage.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    serveImage.form = serveImageForm
/**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:94
 * @route '/api/buyer/chat/start'
 */
export const start = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/api/buyer/chat/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:94
 * @route '/api/buyer/chat/start'
 */
start.url = (options?: RouteQueryOptions) => {
    return start.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:94
 * @route '/api/buyer/chat/start'
 */
start.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:94
 * @route '/api/buyer/chat/start'
 */
    const startForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:94
 * @route '/api/buyer/chat/start'
 */
        startForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: start.url(options),
            method: 'post',
        })
    
    start.form = startForm
/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:136
 * @route '/api/buyer/chat'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:136
 * @route '/api/buyer/chat'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:136
 * @route '/api/buyer/chat'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:136
 * @route '/api/buyer/chat'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:136
 * @route '/api/buyer/chat'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:136
 * @route '/api/buyer/chat'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:136
 * @route '/api/buyer/chat'
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
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:155
 * @route '/api/buyer/chat/{id}/messages'
 */
export const messages = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/api/buyer/chat/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:155
 * @route '/api/buyer/chat/{id}/messages'
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
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:155
 * @route '/api/buyer/chat/{id}/messages'
 */
messages.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:155
 * @route '/api/buyer/chat/{id}/messages'
 */
messages.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:155
 * @route '/api/buyer/chat/{id}/messages'
 */
    const messagesForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:155
 * @route '/api/buyer/chat/{id}/messages'
 */
        messagesForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:155
 * @route '/api/buyer/chat/{id}/messages'
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
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:200
 * @route '/api/buyer/chat/{id}/messages'
 */
export const send = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/api/buyer/chat/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:200
 * @route '/api/buyer/chat/{id}/messages'
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
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:200
 * @route '/api/buyer/chat/{id}/messages'
 */
send.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:200
 * @route '/api/buyer/chat/{id}/messages'
 */
    const sendForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:200
 * @route '/api/buyer/chat/{id}/messages'
 */
        sendForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send.url(args, options),
            method: 'post',
        })
    
    send.form = sendForm
const BuyerChatController = { serveImage, start, index, messages, send }

export default BuyerChatController