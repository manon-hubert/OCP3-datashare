import { Flex, Heading, IconButton } from '@chakra-ui/react';
import { X } from 'lucide-react';
import DashboardFooter from './DashboardFooter';
import NavItem from './NavItem';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <Flex
      as="nav"
      direction="column"
      minH="100vh"
      w={{ base: '295px', md: '259px' }}
      flexShrink={0}
      bg="{colors.dashboard.sidebar.bg}"
      borderRight="2px solid"
      borderColor="{colors.dashboard.sidebar.border}"
      display={{ base: isOpen ? 'flex' : 'none', md: 'flex' }}
      position={{ base: 'fixed', md: 'static' }}
      top={0}
      left={0}
      bottom={0}
      zIndex={{ base: 'modal', md: 'auto' }}
      boxShadow={{ base: '0px 4px 32px rgba(0, 0, 0, 0.25)', md: 'none' }}
    >
      <Flex
        direction={{ base: 'row', md: 'column' }}
        justify={{ base: 'flex-start', md: 'center' }}
        align="center"
        px={{ base: '24px', md: '32px' }}
        gap={{ base: '24px', md: '10px' }}
        h="72px"
        flexShrink={0}
      >
        <IconButton
          aria-label="Fermer le menu"
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          color="white"
          onClick={onClose}
          size="md"
          p="0"
        >
          <X strokeWidth={3} />
        </IconButton>
        <Heading
          as="h1"
          size="h1"
          color="white"
          alignSelf={{ base: 'auto', md: 'stretch' }}
          textAlign="left"
        >
          DataShare
        </Heading>
      </Flex>

      <Flex direction="column" flexGrow={1} p="24px" gap="10px">
        <NavItem to="/my-files" label="Mes fichiers" />
      </Flex>

      <DashboardFooter />
    </Flex>
  );
}

export default Sidebar;
