import { Button, Flex, Heading } from '@chakra-ui/react';

function Header() {
  return (
    <Flex as="header" justify="space-between" align="center" p="3" padding="16px">
      <Heading as="h1" fontSize="2rem" fontWeight="bold">
        Datashare
      </Heading>
      <Button href="/login" variant="solid" size="md">
        Se connecter
      </Button>
    </Flex>
  );
}

export default Header;
