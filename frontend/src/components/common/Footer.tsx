import { Flex, Text } from '@chakra-ui/react';

function Footer() {
  return (
    <Flex
      as="footer"
      justify="space-between"
      align="center"
      py="16px"
      px={{ base: '16px', md: '80px' }}
      w="100%"
      display={{ base: 'none', md: 'flex' }}
      color="white"
    >
      <Text textStyle="normal">Copyright Datashare&copy; {new Date().getFullYear()}</Text>
    </Flex>
  );
}

export default Footer;
