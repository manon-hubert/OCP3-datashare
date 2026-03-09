import { Box, Button, Flex, IconButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex
      as="header"
      direction="column"
      align="center"
      px="6"
      h="64px"
      bg="{colors.dashboard.header.bg}"
      borderBottom="1px solid"
      borderColor="{colors.dashboard.header.border}"
    >
      <Flex
        direction="row"
        justify="flex-end"
        align="center"
        maxW="1280px"
        alignSelf="stretch"
        h="64px"
      >
        <Flex direction="row" align="left" flex="1" display={{ base: 'flex', md: 'none' }}>
          <IconButton
            aria-label="Ouvrir le menu"
            variant="ghost"
            size="md"
            onClick={onToggleSidebar}
            color="black"
          >
            <Menu />
          </IconButton>
        </Flex>

        <Flex direction="row" align="center" gap="16px">
          <Button
            variant="solid"
            size="sm"
            display={{ base: 'none', md: 'flex' }}
            onClick={() => navigate('/')}
          >
            Ajouter des fichiers
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} gap="2">
            <LogOut size={16} />
            <Box display={{ base: 'none', md: 'inline' }}>Déconnexion</Box>
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default DashboardHeader;
