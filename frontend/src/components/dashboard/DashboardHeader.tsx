import { Button, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

function DashboardHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex
      as="header"
      direction="column"
      align="center"
      px="8"
      h="64px"
      bg="{colors.dashboard.header.bg}"
      borderBottom="1px solid"
      borderColor="{colors.dashboard.header.border}"
    >
      <Flex
        direction="row"
        justify="flex-end"
        align="center"
        px="4"
        gap="10px"
        maxW="1280px"
        alignSelf="stretch"
        h="64px"
      >
        <Button variant="solid" size="sm" onClick={() => navigate('/')}>
          Ajouter des fichiers
        </Button>
        <Button variant="ghost" size="sm" onClick={logout} gap="2">
          <LogOut size={16} />
          Déconnexion
        </Button>
      </Flex>
    </Flex>
  );
}

export default DashboardHeader;
