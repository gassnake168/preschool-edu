import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = '请选择',
    label,
    name, // 新增 name 属性以支持原生表单提交
    required = false,
    className = "",
    primaryColor = "teal" // teal, orange, purple, etc.
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const containerRef = useRef(null);

    // 同步外部 value 到内部状态
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const colors = {
        teal: { border: 'focus:ring-teal-500', bg: 'bg-teal-50', text: 'text-teal-700', hover: 'hover:bg-teal-50', active: 'bg-teal-600 text-white' },
        orange: { border: 'focus:ring-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', hover: 'hover:bg-orange-50', active: 'bg-orange-600 text-white' },
        purple: { border: 'focus:ring-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-50', active: 'bg-purple-600 text-white' },
        blue: { border: 'focus:ring-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-50', active: 'bg-blue-600 text-white' }
    };

    const theme = colors[primaryColor] || colors.teal;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === internalValue || (opt.id || opt.name || opt) === internalValue || opt === internalValue);
    const displayValue = selectedOption?.label || selectedOption?.name || selectedOption || '';

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}

            {/* 隐藏的 input 用于原生表单提交 */}
            {name && <input type="hidden" name={name} value={internalValue || ''} required={required} />}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:border-${primaryColor}-400 ${isOpen ? `ring-2 ring-${primaryColor}-500 border-transparent shadow-sm` : ''}`}
            >
                <span className={`${!displayValue ? 'text-gray-400' : 'text-gray-700'} truncate`}>
                    {displayValue || placeholder}
                </span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto custom-scrollbar">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center italic">无可用选项</div>
                    ) : (
                        options.map((opt, idx) => {
                            const optValue = opt.value !== undefined ? opt.value : (opt.id || opt.name || opt);
                            const optLabel = opt.label || opt.name || opt;
                            const isSelected = optValue === internalValue;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setInternalValue(optValue);
                                        if (onChange) onChange({ target: { value: optValue, name: name } });
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? theme.active : `text-gray-600 ${theme.hover}`}`}
                                >
                                    <span className="truncate">{optLabel}</span>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
