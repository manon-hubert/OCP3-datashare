import { Button, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

function DashboardHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex as="header" justify="flex-end" align="center" gap="4" px="8" py="4">
      <Button variant="solid" size="md" onClick={() => navigate('/')}>
        Ajouter des fichiers
      </Button>
      <Button variant="ghost" size="md" onClick={logout} gap="2">
        <LogOut size={16} />
        Déconnexion
      </Button>
    </Flex>
  );
}

export default DashboardHeader;
