// src/components/common/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import SiteFooter from './SiteFooter';

const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <SiteFooter />
  </div>
);

export default MainLayout;
