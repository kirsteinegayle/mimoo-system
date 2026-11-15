import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\VoucherController::validate
 * @see app/Http/Controllers/Admin/VoucherController.php:180
 * @route '/api/vouchers/validate'
 */
export const validate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validate.url(options),
    method: 'post',
})

validate.definition = {
    methods: ["post"],
    url: '/api/vouchers/validate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::validate
 * @see app/Http/Controllers/Admin/VoucherController.php:180
 * @route '/api/vouchers/validate'
 */
validate.url = (options?: RouteQueryOptions) => {
    return validate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::validate
 * @see app/Http/Controllers/Admin/VoucherController.php:180
 * @route '/api/vouchers/validate'
 */
validate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validate.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::validate
 * @see app/Http/Controllers/Admin/VoucherController.php:180
 * @route '/api/vouchers/validate'
 */
    const validateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: validate.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::validate
 * @see app/Http/Controllers/Admin/VoucherController.php:180
 * @route '/api/vouchers/validate'
 */
        validateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: validate.url(options),
            method: 'post',
        })
    
    validate.form = validateForm
/**
* @see \App\Http\Controllers\Admin\VoucherController::available
 * @see app/Http/Controllers/Admin/VoucherController.php:209
 * @route '/api/vouchers/available'
 */
export const available = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: available.url(options),
    method: 'get',
})

available.definition = {
    methods: ["get","head"],
    url: '/api/vouchers/available',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::available
 * @see app/Http/Controllers/Admin/VoucherController.php:209
 * @route '/api/vouchers/available'
 */
available.url = (options?: RouteQueryOptions) => {
    return available.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::available
 * @see app/Http/Controllers/Admin/VoucherController.php:209
 * @route '/api/vouchers/available'
 */
available.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: available.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\VoucherController::available
 * @see app/Http/Controllers/Admin/VoucherController.php:209
 * @route '/api/vouchers/available'
 */
available.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: available.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::available
 * @see app/Http/Controllers/Admin/VoucherController.php:209
 * @route '/api/vouchers/available'
 */
    const availableForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: available.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::available
 * @see app/Http/Controllers/Admin/VoucherController.php:209
 * @route '/api/vouchers/available'
 */
        availableForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: available.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\VoucherController::available
 * @see app/Http/Controllers/Admin/VoucherController.php:209
 * @route '/api/vouchers/available'
 */
        availableForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: available.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    available.form = availableForm
/**
* @see \App\Http\Controllers\Admin\VoucherController::claim
 * @see app/Http/Controllers/Admin/VoucherController.php:217
 * @route '/api/vouchers/claim'
 */
export const claim = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claim.url(options),
    method: 'post',
})

claim.definition = {
    methods: ["post"],
    url: '/api/vouchers/claim',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::claim
 * @see app/Http/Controllers/Admin/VoucherController.php:217
 * @route '/api/vouchers/claim'
 */
claim.url = (options?: RouteQueryOptions) => {
    return claim.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::claim
 * @see app/Http/Controllers/Admin/VoucherController.php:217
 * @route '/api/vouchers/claim'
 */
claim.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: claim.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::claim
 * @see app/Http/Controllers/Admin/VoucherController.php:217
 * @route '/api/vouchers/claim'
 */
    const claimForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: claim.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::claim
 * @see app/Http/Controllers/Admin/VoucherController.php:217
 * @route '/api/vouchers/claim'
 */
        claimForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: claim.url(options),
            method: 'post',
        })
    
    claim.form = claimForm
/**
* @see \App\Http\Controllers\Admin\VoucherController::index
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/vouchers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::index
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::index
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\VoucherController::index
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::index
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::index
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\VoucherController::index
 * @see app/Http/Controllers/Admin/VoucherController.php:22
 * @route '/admin/vouchers'
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
* @see \App\Http\Controllers\Admin\VoucherController::store
 * @see app/Http/Controllers/Admin/VoucherController.php:126
 * @route '/admin/vouchers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/vouchers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::store
 * @see app/Http/Controllers/Admin/VoucherController.php:126
 * @route '/admin/vouchers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::store
 * @see app/Http/Controllers/Admin/VoucherController.php:126
 * @route '/admin/vouchers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::store
 * @see app/Http/Controllers/Admin/VoucherController.php:126
 * @route '/admin/vouchers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::store
 * @see app/Http/Controllers/Admin/VoucherController.php:126
 * @route '/admin/vouchers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\VoucherController::update
 * @see app/Http/Controllers/Admin/VoucherController.php:138
 * @route '/admin/vouchers/{voucher}'
 */
export const update = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/vouchers/{voucher}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::update
 * @see app/Http/Controllers/Admin/VoucherController.php:138
 * @route '/admin/vouchers/{voucher}'
 */
update.url = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { voucher: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { voucher: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    voucher: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        voucher: typeof args.voucher === 'object'
                ? args.voucher.id
                : args.voucher,
                }

    return update.definition.url
            .replace('{voucher}', parsedArgs.voucher.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::update
 * @see app/Http/Controllers/Admin/VoucherController.php:138
 * @route '/admin/vouchers/{voucher}'
 */
update.put = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::update
 * @see app/Http/Controllers/Admin/VoucherController.php:138
 * @route '/admin/vouchers/{voucher}'
 */
    const updateForm = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::update
 * @see app/Http/Controllers/Admin/VoucherController.php:138
 * @route '/admin/vouchers/{voucher}'
 */
        updateForm.put = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Admin\VoucherController::destroy
 * @see app/Http/Controllers/Admin/VoucherController.php:158
 * @route '/admin/vouchers/{voucher}'
 */
export const destroy = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/vouchers/{voucher}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::destroy
 * @see app/Http/Controllers/Admin/VoucherController.php:158
 * @route '/admin/vouchers/{voucher}'
 */
destroy.url = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { voucher: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { voucher: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    voucher: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        voucher: typeof args.voucher === 'object'
                ? args.voucher.id
                : args.voucher,
                }

    return destroy.definition.url
            .replace('{voucher}', parsedArgs.voucher.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::destroy
 * @see app/Http/Controllers/Admin/VoucherController.php:158
 * @route '/admin/vouchers/{voucher}'
 */
destroy.delete = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::destroy
 * @see app/Http/Controllers/Admin/VoucherController.php:158
 * @route '/admin/vouchers/{voucher}'
 */
    const destroyForm = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::destroy
 * @see app/Http/Controllers/Admin/VoucherController.php:158
 * @route '/admin/vouchers/{voucher}'
 */
        destroyForm.delete = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\Admin\VoucherController::toggleStatus
 * @see app/Http/Controllers/Admin/VoucherController.php:171
 * @route '/admin/vouchers/{voucher}/toggle'
 */
export const toggleStatus = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})

toggleStatus.definition = {
    methods: ["patch"],
    url: '/admin/vouchers/{voucher}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\VoucherController::toggleStatus
 * @see app/Http/Controllers/Admin/VoucherController.php:171
 * @route '/admin/vouchers/{voucher}/toggle'
 */
toggleStatus.url = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { voucher: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { voucher: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    voucher: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        voucher: typeof args.voucher === 'object'
                ? args.voucher.id
                : args.voucher,
                }

    return toggleStatus.definition.url
            .replace('{voucher}', parsedArgs.voucher.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\VoucherController::toggleStatus
 * @see app/Http/Controllers/Admin/VoucherController.php:171
 * @route '/admin/vouchers/{voucher}/toggle'
 */
toggleStatus.patch = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\VoucherController::toggleStatus
 * @see app/Http/Controllers/Admin/VoucherController.php:171
 * @route '/admin/vouchers/{voucher}/toggle'
 */
    const toggleStatusForm = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\VoucherController::toggleStatus
 * @see app/Http/Controllers/Admin/VoucherController.php:171
 * @route '/admin/vouchers/{voucher}/toggle'
 */
        toggleStatusForm.patch = (args: { voucher: number | { id: number } } | [voucher: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    toggleStatus.form = toggleStatusForm
const VoucherController = { validate, available, claim, index, store, update, destroy, toggleStatus }

export default VoucherController