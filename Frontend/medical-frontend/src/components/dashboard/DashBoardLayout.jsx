import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout = () => {
	  return (
		      <div className="flex min-h-screen bg-gray-50">
		        <DashboardSidebar />
		        <main className="flex-1 overflow-x-hidden overflow-y-auto">
		          <div className="container mx-auto px-6 py-8">
		            <Outlet />
		          </div>
		        </main>
		      </div>
		    );
};

export default DashboardLayout;
