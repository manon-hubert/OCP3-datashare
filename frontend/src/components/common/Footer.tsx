import { Flex, Text } from '@chakra-ui/react';

function Footer() {
  return (
    <Flex as="footer" p="4" color="white">
      <Text textStyle="normal">Copyright Datashare&copy; {new Date().getFullYear()}</Text>
    </Flex>
  );
}

export default Footer;
