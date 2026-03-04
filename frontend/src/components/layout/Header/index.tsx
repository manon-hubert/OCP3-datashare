import { Button, Flex, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <Flex as="header" justify="space-between" align="center" p="3" padding="16px">
      <Heading asChild as="h1" size="h1" m="0">
        <Link to="/">Datashare</Link>
      </Heading>
      {isAuthenticated ? (
        <Button asChild variant="solid" size="md">
          <Link to="/my-files">Mon espace</Link>
        </Button>
      ) : (
        <Button asChild variant="solid" size="md">
          <Link to="/login">Se connecter</Link>
        </Button>
      )}
    </Flex>
  );
}

export default Header;
