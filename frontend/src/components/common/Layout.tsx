import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer.tsx';
import Header from './Header.tsx';

function Layout() {
  return (
    <Flex direction="column" minH="100vh" w="100%" mx="auto">
      <Header />
      <Outlet />
      <Footer />
    </Flex>
  );
}

export default Layout;
