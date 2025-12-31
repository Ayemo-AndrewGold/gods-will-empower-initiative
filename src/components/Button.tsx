import React from 'react'
import { MoveRight, Loader2 } from "lucide-react";

interface ButtonProps {
  title: string;
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onClick, isDisabled, isLoading }) => {
  return (
    <button 
      className={`w-[200px] h-[50px] rounded-full text-white text-base font-semibold flex items-center justify-evenly ${
        isLoading || isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#028835]'
      }`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Loading...
        </>
      ) : (
        <>
          {title}
          <span className="w-[30px] h-[30px] ml-5 flex items-center justify-center bg-white rounded-full">
            <MoveRight color="#000000" size={20} />
          </span>
        </>
      )}
    </button>
  )
}

export default Button
