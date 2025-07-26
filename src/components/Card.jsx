import React from 'react'

const Card = ({imageSrc,altText,title,description}) => {
  return (
    <div className='justify-center grid p-8 bg-gray-500 hover:bg-amber-500 transition-all duration-300 ease-in-out rounded-xl w-80 h-65 text-black'>
      <div className='pb-5 flex justify-center'><img src={imageSrc} alt={altText}  className='size-10'/></div>
      
      <h1 className='text-xl text-center font-bold'>{title}</h1>
      <p className='text-center text-white pt-3'>{description}</p>
    </div>
  )
}

export default Card
