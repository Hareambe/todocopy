import React, { useState, FocusEvent } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import './float.scss';

interface FloatingLabelDropdownProps {
	options: { label: string; value: any }[];
	selectedOption: any;
	setSelectedOption: (value: any) => void;
	setprevSelectedOption: (value: any) => void;
	label: string;
}

const FloatingLabelDropdown: React.FC<FloatingLabelDropdownProps> = ({
	options,
	selectedOption,
	setSelectedOption,
	setprevSelectedOption,
	label,
}) => {
	const [isFocused, setIsFocused] = useState(false);

	const handleFocus = (e: FocusEvent<HTMLDivElement>) => setIsFocused(true);
	const handleBlur = (e: FocusEvent<HTMLDivElement>) => setIsFocused(false);

	return (
		<div className='form-floating'>
			<Dropdown
				value={selectedOption}
				options={options}
				onChange={(e: DropdownChangeEvent) => {
					setprevSelectedOption(selectedOption);
					setSelectedOption(e.value);
				}}
				onFocus={handleFocus}
				onBlur={handleBlur}
				placeholder=' ' // Keep placeholder empty to control label floating
				className='form-select'
				style={{
					width: '100%',
					padding: '0.75rem 1.5rem 0.375rem 0.75rem',
				}} // Adjust styles if needed
				id='floatingSelect'
			/>
			<label
				htmlFor='floatingSelect'
				className={`${isFocused || selectedOption ? 'float' : ''}`}
			>
				{label}
			</label>
		</div>
	);
};

export default FloatingLabelDropdown;
