import React from 'react';

const Card = ({ imageSrc, altText, title, description }) => {
  return (
    <div
      className="
        w-full h-full
        flex flex-col
        p-6
        rounded-2xl
        bg-white/90
        text-gray-900
        shadow-[0_8px_28px_rgba(0,0,0,0.08)]
        transition-all duration-300 ease-in-out
        hover:bg-amber-50
      "
    >
      <div className="pb-4 flex justify-center">
        <img src={imageSrc} alt={altText || ''} className="w-14 h-14 object-contain" />
      </div>

      <h3 className="text-base md:text-lg font-semibold text-center">{title}</h3>

      {/* Keep paragraphs from overflowing; clamp lines on mobile for even heights */}
      <p className="mt-3 text-sm text-gray-700 text-center break-words line-clamp-4 md:line-clamp-6">
        {description}
      </p>

      {/* Optional CTA zone: stick to bottom if needed */}
      {/* <div className="mt-auto pt-4 text-center"><Button>Learn more</Button></div> */}
    </div>
  );
};

export default Card;
