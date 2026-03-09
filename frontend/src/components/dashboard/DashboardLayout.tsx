import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar.tsx';
import DashboardHeader from './DashboardHeader.tsx';

function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Flex minH="100vh">
      {isSidebarOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          inset="0"
          bg="blackAlpha.600"
          zIndex="overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Flex direction="column" flex="1" bg="#FAF5F0" overflow="auto">
        <DashboardHeader onToggleSidebar={() => setIsSidebarOpen((o) => !o)} />
        <Box flex="1" p="6">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardLayout;
