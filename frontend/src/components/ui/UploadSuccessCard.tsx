import { Box, Button, Flex, FormatByte, Heading, Stack, Text } from '@chakra-ui/react';
import { Copy, FilePlus } from 'lucide-react';
import type { UploadedFile } from '../../api/files';

interface UploadSuccessCardProps {
  uploadedFile: UploadedFile;
}

const UploadSuccessCard = ({ uploadedFile }: UploadSuccessCardProps) => {
  const shareUrl = `${window.location.origin}/share/${uploadedFile.downloadToken}`;

  return (
    <Box
      layerStyle="card"
      width="100%"
      maxW={{ base: '100%', md: '540px' }}
      borderRadius={{ base: '16px 16px 0px 0px', md: '16px' }}
      position={{ base: 'fixed', md: 'static' }}
      bottom={{ base: '0', md: 'auto' }}
      left={{ base: '0', md: 'auto' }}
      right={{ base: '0', md: 'auto' }}
    >
      <Stack gap="6">
        <Heading as="h2" textStyle="h2" textAlign="center" m="0">
          Ajouter un fichier
        </Heading>

        <Flex direction="row" align="center" p="2" gap="4" h="56px" minW={0}>
          <Box flexShrink={0} w="24px" h="24px" color="form.darkText">
            <FilePlus size={24} />
          </Box>
          <Flex direction="column" justify="center" align="flex-start" flex="1" h="40px" minW={0}>
            <Text
              textStyle="normal"
              color="form.darkText"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              w="100%"
            >
              {uploadedFile.originalName}
            </Text>
            <Text textStyle="small" color="form.darkText">
              <FormatByte value={uploadedFile.size} unitDisplay="short" unitSystem="decimal" />
            </Text>
          </Flex>
        </Flex>

        <Stack gap="2">
          <Text textStyle="normal" color="form.darkText">
            Félicitations, ton fichier sera conservé chez nous pendant une semaine !
          </Text>
          <Flex
            align="center"
            px="4"
            py="2"
            gap="10px"
            bg="form.linkBg"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="form.linkBorder"
          >
            <Text
              textStyle="normal"
              textDecoration="underline"
              color="form.linkText"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {shareUrl}
            </Text>
          </Flex>
        </Stack>

        <Button variant="surface" onClick={() => navigator.clipboard.writeText(shareUrl)}>
          <Copy /> Copier le lien
        </Button>
      </Stack>
    </Box>
  );
};

export default UploadSuccessCard;
