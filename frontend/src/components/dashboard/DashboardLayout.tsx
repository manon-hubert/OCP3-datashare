import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import DashboardHeader from './DashboardHeader.tsx';

function DashboardLayout() {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Flex direction="column" flex="1" bg="#FAF5F0" overflow="auto">
        <DashboardHeader />
        <Box flex="1" p="6">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardLayout;
