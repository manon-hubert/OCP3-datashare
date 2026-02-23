import { Flex, Text } from '@chakra-ui/react';

function Footer() {
  return (
    <Flex as="footer" p="4" color="white">
      <Text>Copyright Datashare&copy; {new Date().getFullYear()}</Text>
    </Flex>
  );
}

export default Footer;
