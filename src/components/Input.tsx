import React, { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  handleChange: (value: string) => void;
  action?: () => void;
}

const Input: React.FC<InputProps> = ({ label, value, handleChange, action, ...props }) => {
  return (
    <div className="mb-4 relative">
      <input
        {...props}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder=" "
        className="peer w-full p-3 md:p-4 border border-gray-300 outline-none bg-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <label
        htmlFor={props.id}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-1/2 top-1/2 left-4 z-10 origin-[0] 
                   peer-focus:text-xs peer-focus:top-2 peer-focus:translate-y-0
                   peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0
                   pointer-events-none"
      >
        {label}
      </label>
      {action && (
        <button
          type="button"
          onClick={action}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          Action
        </button>
      )}
    </div>
  );
}

export default Input;
