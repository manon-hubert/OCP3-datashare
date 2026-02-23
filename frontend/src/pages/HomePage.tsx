import CloudUploadButton from '../components/ui/CloudUploadButton';
import { Flex, Heading, VStack } from '@chakra-ui/react';

const HomePage = () => {
  const handleUpload = () => {
    // your upload logic here
  };

  return (
    <Flex as="main" flex="1" align="center" justify="center">
      <VStack gap="4">
        <Heading fontSize="30px" fontWeight="300" textAlign="center" lineHeight="40px" m="0">
          Tu veux partager un fichier ?
        </Heading>
        <CloudUploadButton onClick={handleUpload} />
      </VStack>
    </Flex>
  );
};

export default HomePage;
