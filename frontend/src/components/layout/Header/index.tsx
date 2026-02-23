import { Button, Flex, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Flex as="header" justify="space-between" align="center" p="3" padding="16px">
      <Heading as="h1" fontSize="2rem" fontWeight="bold">
        Datashare
      </Heading>
      <Button asChild variant="solid" size="md">
        <Link to="/login">Se connecter</Link>
      </Button>
    </Flex>
  );
}

export default Header;
