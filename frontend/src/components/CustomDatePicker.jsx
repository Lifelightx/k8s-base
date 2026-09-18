import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
  <button
    type="button"
    className={`text-left px-2.5 py-1.5 rounded-md border border-border bg-surface2 text-text outline-none focus:border-accent transition-colors duration-200 text-xs min-w-[130px] ${className}`}
    onClick={onClick}
    ref={ref}
  >
    {value || placeholder || 'Select date'}
  </button>
));

export default function CustomDatePicker({ selected, onChange, placeholderText = 'dd/mm/yyyy, --:--', className = '' }) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="dd/MM/yyyy, HH:mm"
      placeholderText={placeholderText}
      customInput={<CustomInput className={className} />}
      calendarClassName="modern-dark-calendar"
      popperClassName="modern-dark-popper"
      popperPlacement="bottom-start"
    />
  );
}
