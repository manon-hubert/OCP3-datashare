import { Flex, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import Footer from '../common/Footer';
import NavItem from './NavItem';

function Sidebar() {
  return (
    <Flex
      as="nav"
      direction="column"
      minH="100vh"
      flexShrink={0}
      bg="{colors.dashboard.sidebar.bg}"
      borderRight="2px solid"
      borderColor="{colors.dashboard.sidebar.border}"
    >
      <Flex direction="column" justify="center" align="center" px="32px" h="72px" flexShrink={0}>
        <Heading asChild as="h1" size="h1" color="white" alignSelf="stretch">
          <Link to="/">DataShare</Link>
        </Heading>
      </Flex>

      <Flex direction="column" flexGrow={1} p="24px" gap="10px">
        <NavItem to="/my-files" label="Mes fichiers" />
      </Flex>

      <Footer />
    </Flex>
  );
}

export default Sidebar;
