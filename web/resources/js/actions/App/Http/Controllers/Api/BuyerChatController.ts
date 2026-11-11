import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:250
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
 * @see app/Http/Controllers/Api/BuyerChatController.php:250
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
 * @see app/Http/Controllers/Api/BuyerChatController.php:250
 * @route '/api/buyer/chat-image/{filename}'
 */
serveImage.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serveImage.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:250
 * @route '/api/buyer/chat-image/{filename}'
 */
serveImage.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: serveImage.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:250
 * @route '/api/buyer/chat-image/{filename}'
 */
    const serveImageForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: serveImage.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:250
 * @route '/api/buyer/chat-image/{filename}'
 */
        serveImageForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: serveImage.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::serveImage
 * @see app/Http/Controllers/Api/BuyerChatController.php:250
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
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/api/buyer/chat/start'
 */
const startb76ecf10e9c0c1c4046e592023b9b5d6 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startb76ecf10e9c0c1c4046e592023b9b5d6.url(options),
    method: 'post',
})

startb76ecf10e9c0c1c4046e592023b9b5d6.definition = {
    methods: ["post"],
    url: '/api/buyer/chat/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/api/buyer/chat/start'
 */
startb76ecf10e9c0c1c4046e592023b9b5d6.url = (options?: RouteQueryOptions) => {
    return startb76ecf10e9c0c1c4046e592023b9b5d6.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/api/buyer/chat/start'
 */
startb76ecf10e9c0c1c4046e592023b9b5d6.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startb76ecf10e9c0c1c4046e592023b9b5d6.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/api/buyer/chat/start'
 */
    const startb76ecf10e9c0c1c4046e592023b9b5d6Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: startb76ecf10e9c0c1c4046e592023b9b5d6.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/api/buyer/chat/start'
 */
        startb76ecf10e9c0c1c4046e592023b9b5d6Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: startb76ecf10e9c0c1c4046e592023b9b5d6.url(options),
            method: 'post',
        })
    
    startb76ecf10e9c0c1c4046e592023b9b5d6.form = startb76ecf10e9c0c1c4046e592023b9b5d6Form
    /**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/buyer/chat/start'
 */
const startb758f05dacf4581c92fe52356e3a2fad = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startb758f05dacf4581c92fe52356e3a2fad.url(options),
    method: 'post',
})

startb758f05dacf4581c92fe52356e3a2fad.definition = {
    methods: ["post"],
    url: '/buyer/chat/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/buyer/chat/start'
 */
startb758f05dacf4581c92fe52356e3a2fad.url = (options?: RouteQueryOptions) => {
    return startb758f05dacf4581c92fe52356e3a2fad.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/buyer/chat/start'
 */
startb758f05dacf4581c92fe52356e3a2fad.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startb758f05dacf4581c92fe52356e3a2fad.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/buyer/chat/start'
 */
    const startb758f05dacf4581c92fe52356e3a2fadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: startb758f05dacf4581c92fe52356e3a2fad.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::start
 * @see app/Http/Controllers/Api/BuyerChatController.php:96
 * @route '/buyer/chat/start'
 */
        startb758f05dacf4581c92fe52356e3a2fadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: startb758f05dacf4581c92fe52356e3a2fad.url(options),
            method: 'post',
        })
    
    startb758f05dacf4581c92fe52356e3a2fad.form = startb758f05dacf4581c92fe52356e3a2fadForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerChatController::start, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `start['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const start = {
    '/api/buyer/chat/start': startb76ecf10e9c0c1c4046e592023b9b5d6,
    '/buyer/chat/start': startb758f05dacf4581c92fe52356e3a2fad,
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/api/buyer/chat'
 */
const index46e4cea37d2a48683c3132bf5de1a6c4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index46e4cea37d2a48683c3132bf5de1a6c4.url(options),
    method: 'get',
})

index46e4cea37d2a48683c3132bf5de1a6c4.definition = {
    methods: ["get","head"],
    url: '/api/buyer/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/api/buyer/chat'
 */
index46e4cea37d2a48683c3132bf5de1a6c4.url = (options?: RouteQueryOptions) => {
    return index46e4cea37d2a48683c3132bf5de1a6c4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/api/buyer/chat'
 */
index46e4cea37d2a48683c3132bf5de1a6c4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index46e4cea37d2a48683c3132bf5de1a6c4.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/api/buyer/chat'
 */
index46e4cea37d2a48683c3132bf5de1a6c4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index46e4cea37d2a48683c3132bf5de1a6c4.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/api/buyer/chat'
 */
    const index46e4cea37d2a48683c3132bf5de1a6c4Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index46e4cea37d2a48683c3132bf5de1a6c4.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/api/buyer/chat'
 */
        index46e4cea37d2a48683c3132bf5de1a6c4Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index46e4cea37d2a48683c3132bf5de1a6c4.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/api/buyer/chat'
 */
        index46e4cea37d2a48683c3132bf5de1a6c4Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index46e4cea37d2a48683c3132bf5de1a6c4.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index46e4cea37d2a48683c3132bf5de1a6c4.form = index46e4cea37d2a48683c3132bf5de1a6c4Form
    /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/buyer/chat/threads'
 */
const index7422751034509af694ad29554671ca82 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index7422751034509af694ad29554671ca82.url(options),
    method: 'get',
})

index7422751034509af694ad29554671ca82.definition = {
    methods: ["get","head"],
    url: '/buyer/chat/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/buyer/chat/threads'
 */
index7422751034509af694ad29554671ca82.url = (options?: RouteQueryOptions) => {
    return index7422751034509af694ad29554671ca82.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/buyer/chat/threads'
 */
index7422751034509af694ad29554671ca82.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index7422751034509af694ad29554671ca82.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/buyer/chat/threads'
 */
index7422751034509af694ad29554671ca82.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index7422751034509af694ad29554671ca82.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/buyer/chat/threads'
 */
    const index7422751034509af694ad29554671ca82Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index7422751034509af694ad29554671ca82.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/buyer/chat/threads'
 */
        index7422751034509af694ad29554671ca82Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index7422751034509af694ad29554671ca82.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::index
 * @see app/Http/Controllers/Api/BuyerChatController.php:138
 * @route '/buyer/chat/threads'
 */
        index7422751034509af694ad29554671ca82Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index7422751034509af694ad29554671ca82.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index7422751034509af694ad29554671ca82.form = index7422751034509af694ad29554671ca82Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerChatController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/chat': index46e4cea37d2a48683c3132bf5de1a6c4,
    '/buyer/chat/threads': index7422751034509af694ad29554671ca82,
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/api/buyer/chat/{id}/messages'
 */
const messages2326a71ca2e13397a5fc4471b330cb54 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages2326a71ca2e13397a5fc4471b330cb54.url(args, options),
    method: 'get',
})

messages2326a71ca2e13397a5fc4471b330cb54.definition = {
    methods: ["get","head"],
    url: '/api/buyer/chat/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/api/buyer/chat/{id}/messages'
 */
messages2326a71ca2e13397a5fc4471b330cb54.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messages2326a71ca2e13397a5fc4471b330cb54.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/api/buyer/chat/{id}/messages'
 */
messages2326a71ca2e13397a5fc4471b330cb54.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages2326a71ca2e13397a5fc4471b330cb54.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/api/buyer/chat/{id}/messages'
 */
messages2326a71ca2e13397a5fc4471b330cb54.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages2326a71ca2e13397a5fc4471b330cb54.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/api/buyer/chat/{id}/messages'
 */
    const messages2326a71ca2e13397a5fc4471b330cb54Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages2326a71ca2e13397a5fc4471b330cb54.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/api/buyer/chat/{id}/messages'
 */
        messages2326a71ca2e13397a5fc4471b330cb54Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages2326a71ca2e13397a5fc4471b330cb54.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/api/buyer/chat/{id}/messages'
 */
        messages2326a71ca2e13397a5fc4471b330cb54Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages2326a71ca2e13397a5fc4471b330cb54.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messages2326a71ca2e13397a5fc4471b330cb54.form = messages2326a71ca2e13397a5fc4471b330cb54Form
    /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/buyer/chat/{id}/messages'
 */
const messagesd1faabcd653b1c21c497afd829983ee2 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesd1faabcd653b1c21c497afd829983ee2.url(args, options),
    method: 'get',
})

messagesd1faabcd653b1c21c497afd829983ee2.definition = {
    methods: ["get","head"],
    url: '/buyer/chat/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/buyer/chat/{id}/messages'
 */
messagesd1faabcd653b1c21c497afd829983ee2.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messagesd1faabcd653b1c21c497afd829983ee2.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/buyer/chat/{id}/messages'
 */
messagesd1faabcd653b1c21c497afd829983ee2.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesd1faabcd653b1c21c497afd829983ee2.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/buyer/chat/{id}/messages'
 */
messagesd1faabcd653b1c21c497afd829983ee2.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messagesd1faabcd653b1c21c497afd829983ee2.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/buyer/chat/{id}/messages'
 */
    const messagesd1faabcd653b1c21c497afd829983ee2Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messagesd1faabcd653b1c21c497afd829983ee2.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/buyer/chat/{id}/messages'
 */
        messagesd1faabcd653b1c21c497afd829983ee2Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messagesd1faabcd653b1c21c497afd829983ee2.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerChatController::messages
 * @see app/Http/Controllers/Api/BuyerChatController.php:157
 * @route '/buyer/chat/{id}/messages'
 */
        messagesd1faabcd653b1c21c497afd829983ee2Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messagesd1faabcd653b1c21c497afd829983ee2.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messagesd1faabcd653b1c21c497afd829983ee2.form = messagesd1faabcd653b1c21c497afd829983ee2Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerChatController::messages, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `messages['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const messages = {
    '/api/buyer/chat/{id}/messages': messages2326a71ca2e13397a5fc4471b330cb54,
    '/buyer/chat/{id}/messages': messagesd1faabcd653b1c21c497afd829983ee2,
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/api/buyer/chat/{id}/messages'
 */
const send2326a71ca2e13397a5fc4471b330cb54 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send2326a71ca2e13397a5fc4471b330cb54.url(args, options),
    method: 'post',
})

send2326a71ca2e13397a5fc4471b330cb54.definition = {
    methods: ["post"],
    url: '/api/buyer/chat/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/api/buyer/chat/{id}/messages'
 */
send2326a71ca2e13397a5fc4471b330cb54.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return send2326a71ca2e13397a5fc4471b330cb54.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/api/buyer/chat/{id}/messages'
 */
send2326a71ca2e13397a5fc4471b330cb54.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send2326a71ca2e13397a5fc4471b330cb54.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/api/buyer/chat/{id}/messages'
 */
    const send2326a71ca2e13397a5fc4471b330cb54Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send2326a71ca2e13397a5fc4471b330cb54.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/api/buyer/chat/{id}/messages'
 */
        send2326a71ca2e13397a5fc4471b330cb54Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send2326a71ca2e13397a5fc4471b330cb54.url(args, options),
            method: 'post',
        })
    
    send2326a71ca2e13397a5fc4471b330cb54.form = send2326a71ca2e13397a5fc4471b330cb54Form
    /**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/buyer/chat/{id}/messages'
 */
const sendd1faabcd653b1c21c497afd829983ee2 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendd1faabcd653b1c21c497afd829983ee2.url(args, options),
    method: 'post',
})

sendd1faabcd653b1c21c497afd829983ee2.definition = {
    methods: ["post"],
    url: '/buyer/chat/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/buyer/chat/{id}/messages'
 */
sendd1faabcd653b1c21c497afd829983ee2.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return sendd1faabcd653b1c21c497afd829983ee2.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/buyer/chat/{id}/messages'
 */
sendd1faabcd653b1c21c497afd829983ee2.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendd1faabcd653b1c21c497afd829983ee2.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/buyer/chat/{id}/messages'
 */
    const sendd1faabcd653b1c21c497afd829983ee2Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sendd1faabcd653b1c21c497afd829983ee2.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerChatController::send
 * @see app/Http/Controllers/Api/BuyerChatController.php:203
 * @route '/buyer/chat/{id}/messages'
 */
        sendd1faabcd653b1c21c497afd829983ee2Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sendd1faabcd653b1c21c497afd829983ee2.url(args, options),
            method: 'post',
        })
    
    sendd1faabcd653b1c21c497afd829983ee2.form = sendd1faabcd653b1c21c497afd829983ee2Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerChatController::send, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `send['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const send = {
    '/api/buyer/chat/{id}/messages': send2326a71ca2e13397a5fc4471b330cb54,
    '/buyer/chat/{id}/messages': sendd1faabcd653b1c21c497afd829983ee2,
}

const BuyerChatController = { serveImage, start, index, messages, send }

export default BuyerChatController