import { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface CustomMultiSelectProps {
    onSelect: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function CustomMultiSelect({
    onSelect,
    options,
    placeholder = 'Select...',
    disabled = false,
    className = ''
}: CustomMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onSelect(optionValue);
        // DON'T close dropdown - keep it open for multiple selections
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent transition ${
                    disabled
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-gray-400 hover:border-gray-300'
                }`}
            >
                <span>{placeholder}</span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No more cities to add
                        </div>
                    ) : (
                        options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className="w-full px-4 py-2 text-sm text-left text-gray-900 hover:bg-[#F1EDFB] hover:text-[#3B1F6B] transition"
                            >
                                {option.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
