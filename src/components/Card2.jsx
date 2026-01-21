import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Card2 = ({ imageSrc, altText, title, description, name, path }) => {
  const navigate = useNavigate();

  return (
    <div className="
      w-full h-full
      flex flex-col
      p-6
      rounded-2xl
      text-gray-900
      shadow-[0_8px_28px_rgba(0,0,0,0.08)]
      bg-gradient-to-tr from-gray-200 to-gray-300
      hover:from-gray-300 hover:to-gray-400
      transition-all duration-300 ease-in-out
    ">
      <div className="pb-4 flex justify-center">
        <img
          src={imageSrc}
          alt={altText || ''}
          className="w-14 h-14 object-contain"
        />
      </div>

      <h3 className="text-lg font-bold text-center">{title}</h3>
      <p className="text-sm text-gray-700 text-center mt-3">{description}</p>

      {/* Push CTA to the bottom without absolute positioning */}
      <div className="mt-auto pt-4 text-center">
        <Button onClick={() => navigate(path)}>{name}</Button>
      </div>
    </div>
  );
};

export default Card2;
