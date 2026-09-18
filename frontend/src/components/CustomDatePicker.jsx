import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
  <button
    type="button"
    className={`text-left px-3 py-1.5 rounded-lg border border-border/50 bg-surface hover:bg-surface2 text-text outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 text-xs shadow-sm min-w-[130px] ${className}`}
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
