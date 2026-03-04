import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

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

export default Sidebar;
