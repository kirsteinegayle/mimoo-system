import { useState } from 'react';

interface ServiceChipsProps {
    label: string;
    required?: boolean;
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    helperText?: string;
    error?: string;
    allowCustom?: boolean;
}

export default function ServiceChips({
    label,
    required,
    options = [],
    selected = [],
    onChange,
    helperText,
    error,
    allowCustom = true,
}: ServiceChipsProps) {
    const [customValue, setCustomValue] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleToggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
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

    const handleRemoveCustom = (value: string) => {
        if (!options.includes(value)) {
            onChange(selected.filter(v => v !== value));
        }
    };

    const customServices = selected.filter(s => !options.includes(s));

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Predefined options */}
            <div className="flex flex-wrap gap-2 mb-3">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleToggle(option)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                            selected.includes(option)
                                ? 'bg-[#3B1F6B] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {/* Custom services */}
            {customServices.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {customServices.map((service) => (
                        <span
                            key={service}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-[#9B5DE5] text-white"
                        >
                            {service}
                            <button
                                type="button"
                                onClick={() => handleRemoveCustom(service)}
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

            {/* Add custom */}
            {allowCustom && (
                <div>
                    {!showCustomInput ? (
                        <button
                            type="button"
                            onClick={() => setShowCustomInput(true)}
                            className="text-sm font-medium text-[#3B1F6B] hover:underline"
                        >
                            + Add other service
                        </button>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
                                placeholder="Type custom service"
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B5DE5] focus:border-transparent"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleAddCustom}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#3B1F6B] rounded-lg hover:bg-[#2E1854]"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustomInput(false);
                                    setCustomValue('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Helper text / Error */}
            {helperText && !error && (
                <p className="mt-2 text-xs text-gray-500">{helperText}</p>
            )}
            {error && (
                <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
