import React from 'react'
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';

const Card2 = ({imageSrc,altText,title,description,name,path}) => {
  const navigate=useNavigate();
  return (
   <div className='justify-center grid p-8 bg-gradient-to-tr from-gray-400 t0-gray-600 hover:bg-gray-800 transition-all duration-300 ease-in-out rounded-xl w-90 h-75 text-black'>
      <div className='pb-5 flex justify-center'><img src={imageSrc} alt={altText}  className='size-10'/></div>
      
      <h1 className='text-xl text-center font-bold'>{title}</h1>
      <p className='text-center text-white pt-3'>{description}</p>
      <div className='justify-center text-center pt-4'>
      <Button onClick={()=>navigate(path)}>
        {name}
      </Button>
      </div>
    </div>
  )
}

export default Card2
