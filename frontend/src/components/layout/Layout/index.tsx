import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import Header from '../Header';

function Layout() {
  return (
    <Flex direction="column" minH="100vh" maxW="90vw" mx="auto">
      <Header />
      <Outlet />
      <Footer />
    </Flex>
  );
}

export default Layout;
