import React from 'react'
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button"
import { SignedIn,SignedOut,UserButton,SignInButton } from '@clerk/clerk-react';

const Navbar = () => {
  const navigate=useNavigate();
  return (
    <div className='py-7 px-10 flex bg-blue-200'>
            <div className='text-4xl text-purple-400'>
              MindFlow Buddy
            </div>
            <div className='flex gap-12 ml-auto py-1'> 
              <Button onClick={() => navigate("/dashboard")} className=" bg-blue-200 text-black">
           DashBoard
           </Button>
           <Button onClick={() => navigate("/features")} className=" bg-blue-200 text-black">
           Features
           </Button>
           <Button onClick={() => navigate("/about")} className=" bg-blue-200 text-black">
            About
           </Button>
          < Button onClick={()=> navigate("/contact")} className=" bg-blue-200 text-black">
            Contact
           </Button>
           < Button onClick={()=>navigate("/Login")} className=" bg-amber-100 text-blue-400">
            Login
           </Button>
           <div onClick={()=>navigate("/get-started")} className='flex'>
            <Button className="bg-blue-700 rounded-l-1xl">
            Get Started
           </Button>
           </div>
           <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut className="">
        <SignInButton />
      </SignedOut>
           </div>
    </div>
  )
}

export default Navbar
