import React, { useState } from 'react'
import Sidebar from '../components/admin/Sidebar'
import UserManagement from './UserManagement';

const Dashboard = () => {
  const [active, setActive] = useState("Users");

  const renderPage = () => {
    switch (active) {
      case "Users": return <UserManagement/>;
      default: return <p className='text-gray-400 text-sm'>Chọn MENU</p>
    }
  }

  return (
    <div className='flex h-screen bg-xamden'>
      {/* Sidebar */}
      <Sidebar active={active} setActive={setActive}/>

      {/* Main */}
      <div className='flex-1 flex flex-col'>
        
        {/* Header */}
        <div className='px-6 py-4'>
          <span className='text-gray-500 text-xs'>
            Page / <span className='text-black font-semibold'>{active}</span>
          </span>

          <p className='text-lg font-semibold mt-1'>
            {active}
          </p>
        </div>

        {/* Content */}
        <div className='flex-1 px-6 pb-6 overflow-auto'>
          {renderPage()}
        </div>

      </div>
    </div>
  )
}

export default Dashboard