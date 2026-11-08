interface RadioCardsProps {
    label: string;
    required?: boolean;
    options: { value: string; label: string; description?: string }[];
    selected: string;
    onChange: (value: string) => void;
    helperText?: string;
    error?: string;
}

export default function RadioCards({
    label,
    required,
    options = [],
    selected = '',
    onChange,
    helperText,
    error,
}: RadioCardsProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`p-4 rounded-lg border-2 text-left transition ${
                            selected === option.value
                                ? 'border-[#3B1F6B] bg-[#F1EDFB]'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selected === option.value
                                        ? 'border-[#3B1F6B] bg-white'
                                        : 'border-gray-300'
                                }`}
                            >
                                {selected === option.value && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#3B1F6B]" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{option.label}</div>
                                {option.description && (
                                    <div className="text-sm text-gray-500 mt-0.5">{option.description}</div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

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
