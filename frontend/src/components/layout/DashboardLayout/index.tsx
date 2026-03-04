import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

function Sidebar() {
  return (
    <Flex
      as="nav"
      direction="column"
      w="230px"
      minH="100vh"
      flexShrink={0}
      background="linear-gradient(to bottom, #E07B5D, #B84630)"
      p="6"
    >
      <Heading asChild as="h1" size="h1" color="white" fontSize="24px" fontWeight="700" mb="10">
        <Link to="/">DataShare</Link>
      </Heading>

      <Box>
        <Box bg="rgba(255,255,255,0.15)" borderRadius="8px" px="4" py="3" cursor="pointer">
          <Text color="white" fontFamily="DM Sans Variable" fontWeight="500" fontSize="15px">
            Mes fichiers
          </Text>
        </Box>
      </Box>

      <Text mt="auto" color="rgba(255,255,255,0.7)" fontSize="13px" fontFamily="DM Sans Variable">
        Copyright DataShare&copy; {new Date().getFullYear()}
      </Text>
    </Flex>
  );
}

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

function DashboardLayout() {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Flex direction="column" flex="1" bg="#FAF5F0" overflow="auto">
        <DashboardHeader />
        <Box flex="1" px="8" pb="8">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardLayout;
