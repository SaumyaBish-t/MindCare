import React from 'react'
import { Button } from "@/components/ui/button"

const Navbar = () => {
  return (
    <div className='py-7 px-10 flex bg-blue-200'>
            <div className='text-4xl text-purple-400'>
              MindFlow Buddy
            </div>
            <div className='flex gap-12 ml-auto py-1'> 
            <Button className= " bg-blue-200 text-black">
            Home
           </Button>
           <Button className=" bg-blue-200 text-black">
           Features
           </Button>
           <Button className=" bg-blue-200 text-black">
            About
           </Button>
           <Button className=" bg-blue-200 text-black">
            Contact
           </Button>
           <div className='flex'>
            <Button className="bg-blue-700 rounded-l-1xl">
            Get Started
           </Button>
           </div>
           </div>
    </div>
  )
}

export default Navbar
