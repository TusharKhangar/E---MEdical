// src/components/common/MainLayout.jsx

import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const MainLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
  </>
);

export default MainLayout;