import React from 'react'

const Navbar = () => {
  return (
    <div className='flex  items-center bg-cyan-950 p-4 text-white justify-between'>
      <div className='flex items-center gap-4'>
      <img src="/processor.png" alt="Processor" className='h-8 w-8'/>
      <div className='flex items-center'>
        <h1 className='text-2xl font-bold'>Memo</h1>
        <h1 className='text-2xl font-bold text-teal-500'>Vista</h1>
      </div>
      </div>
      <a href="https://github.com/Ayush-Sareen/MemoVista.git" target="_blank" rel="noopener noreferrer">
      <div className='flex items-center gap-4 border-2 border-gray-300 rounded-full p-1 hover:bg-black'>
        <div>
          GitHub
        </div>
        <img src="/logo.png" alt="" className='h-8 w-8' />
      </div>
      </a>
      
    </div>
  )
}

export default Navbar
