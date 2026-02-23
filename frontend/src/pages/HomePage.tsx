import CloudUploadButton from '../components/ui/CloudUploadButton';
import { Flex, Heading, VStack } from '@chakra-ui/react';

const HomePage = () => {
  return (
    <Flex as="main" flex="1" align="center" justify="center">
      <VStack gap="4">
        <Heading size="xl" textAlign="center" m="0">
          Tu veux partager un fichier ?
        </Heading>
        <CloudUploadButton />
      </VStack>
    </Flex>
  );
};

export default HomePage;
