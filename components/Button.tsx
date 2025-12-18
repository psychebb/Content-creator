
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-6 py-3 rounded-2xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200',
    secondary: 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200',
    outline: 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
