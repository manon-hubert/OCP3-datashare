import { Box, Button, Flex, FormatByte, Heading, Stack, Text } from '@chakra-ui/react';
import { Copy, FilePlus } from 'lucide-react';
import type { UploadedFile } from '../../api/files';

interface UploadSuccessCardProps {
  uploadedFile: UploadedFile;
}

const UploadSuccessCard = ({ uploadedFile }: UploadSuccessCardProps) => {
  const shareUrl = `${window.location.origin}/share/${uploadedFile.downloadToken}`;

  return (
    <Box layerStyle="card" width="100%" maxW="540px">
      <Stack gap="6">
        <Heading as="h2" size="h2" textAlign="center" m="0">
          Ajouter un fichier
        </Heading>

        <Flex direction="row" align="center" p="2" gap="4" h="56px" minW={0}>
          <Box flexShrink={0} w="24px" h="24px" color="form.darkText">
            <FilePlus size={24} />
          </Box>
          <Flex direction="column" justify="center" align="flex-start" flex="1" h="40px" minW={0}>
            <Text
              textStyle="body"
              color="form.darkText"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              w="100%"
            >
              {uploadedFile.originalName}
            </Text>
            <Text textStyle="caption" color="form.darkText">
              <FormatByte value={uploadedFile.size} unitDisplay="short" unitSystem="decimal" />
            </Text>
          </Flex>
        </Flex>

        <Stack gap="2">
          <Text textStyle="body" color="form.darkText">
            Félicitations, ton fichier sera conservé chez nous pendant une semaine !
          </Text>
          <Flex
            align="center"
            px="4"
            py="2"
            gap="10px"
            bg="form.urlBg"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="form.urlBorder"
          >
            <Text
              textStyle="body"
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
