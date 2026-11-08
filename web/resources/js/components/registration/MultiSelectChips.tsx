import { useState, useRef, useEffect } from 'react';

interface MultiSelectChipsProps {
    label: string;
    required?: boolean;
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    helperText?: string;
    error?: string;
    allowCustom?: boolean;
    loading?: boolean;
    loadingMessage?: string;
    errorMessage?: string;
}

export default function MultiSelectChips({
    label,
    required,
    options = [],
    selected = [],
    onChange,
    placeholder = 'Search or select...',
    helperText,
    error,
    allowCustom = true,
    loading = false,
    loadingMessage = 'Loading...',
    errorMessage,
}: MultiSelectChipsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customValue, setCustomValue] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selected.includes(opt)
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setShowCustomInput(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        if (!selected.includes(value)) {
            onChange([...selected, value]);
        }
        setSearchTerm('');
    };

    const handleRemove = (value: string) => {
        onChange(selected.filter(v => v !== value));
    };

    const handleSelectAll = () => {
        const allValues = [...new Set([...selected, ...options])];
        onChange(allValues);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange([]);
    };

    const handleAddCustom = () => {
        const trimmed = customValue.trim();
        // Keep custom entries with commas as ONE item (don't split)
        if (trimmed && !selected.includes(trimmed)) {
            onChange([...selected, trimmed]);
            setCustomValue('');
            setShowCustomInput(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Selected chips */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selected.map((value) => (
                        <span
                            key={value}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#3B1F6B] text-white"
                        >
                            {value}
                            <button
                                type="button"
                                onClick={() => handleRemove(value)}
                                className="hover:bg-white/20 rounded-full p-0.5"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-[#9B5DE5] focus:border-transparent`}
                />
                {selected.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {selected.length} selected
                    </span>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                    {/* Actions */}
                    <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            disabled={loading}
                            className="text-xs font-medium text-[#3B1F6B] hover:underline disabled:opacity-50"
                        >
                            Select All
                        </button>
                        {selected.length > 0 && (
                            <>
                                <span className="text-gray-300">|</span>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-xs font-medium text-red-600 hover:underline"
                                >
                                    Clear
                                </button>
                            </>
                        )}
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div className="px-4 py-8 flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#3B1F6B] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-500">{loadingMessage}</span>
                        </div>
                    )}

                    {/* Error message */}
                    {!loading && errorMessage && (
                        <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
                            <p className="text-xs text-yellow-800">
                                ⚠️ {errorMessage}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                You can type manually using "Add custom" below.
                            </p>
                        </div>
                    )}

                    {/* Options */}
                    {!loading && (
                        <>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className="w-full text-left px-4 py-2 hover:bg-[#F1EDFB] text-sm text-gray-900 transition"
                                    >
                                        {option}
                                    </button>
                                ))
                            ) : searchTerm ? (
                                <div className="px-4 py-3 text-sm text-gray-500">No matches found</div>
                            ) : options.length === 0 && !errorMessage ? (
                                <div className="px-4 py-3 text-sm text-gray-500">No options available</div>
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">All options selected</div>
                            )}
                        </>
                    )}

                    {/* Custom input */}
                    {allowCustom && !loading && (
                        <div className="border-t border-gray-200 p-2">
                            {!showCustomInput ? (
                                <button
                                    type="button"
                                    onClick={() => setShowCustomInput(true)}
                                    className="w-full text-left px-2 py-1.5 text-xs font-medium text-[#3B1F6B] hover:bg-[#F1EDFB] rounded"
                                >
                                    + Add custom / not listed
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customValue}
                                        onChange={(e) => setCustomValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
                                        placeholder="Type custom value"
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#9B5DE5] focus:border-transparent"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCustom}
                                        className="px-3 py-1 text-xs font-medium text-white bg-[#3B1F6B] rounded hover:bg-[#2E1854]"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Helper text / Error */}
            {helperText && !error && (
                <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
            )}
            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
