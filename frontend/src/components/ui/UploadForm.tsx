import { Alert, Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { CloudUpload, FilePlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface UploadFormData {
  fileName: string;
}

interface UploadFormProps {
  file: File;
  fileSizeError?: boolean;
  isUploading?: boolean;
  uploadError?: string;
  onChangeFile: () => void;
  onUpload: () => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1_000) return `${bytes} o`;
  if (bytes < 1_000_000) return `${parseFloat((bytes / 1_000).toFixed(1)).toLocaleString('fr')} Ko`;
  if (bytes < 1_000_000_000)
    return `${parseFloat((bytes / 1_000_000).toFixed(1)).toLocaleString('fr')} Mo`;
  return `${parseFloat((bytes / 1_000_000_000).toFixed(1)).toLocaleString('fr')} Go`;
}

const maxFileSizeDisplay = formatFileSize(Number(import.meta.env.VITE_MAX_FILE_SIZE));

const UploadForm = ({
  file,
  fileSizeError,
  isUploading,
  uploadError,
  onChangeFile,
  onUpload,
}: UploadFormProps) => {
  const { handleSubmit } = useForm<UploadFormData>({
    defaultValues: { fileName: file.name },
  });

  const onSubmit = handleSubmit(() => {
    onUpload();
  });

  return (
    <Box as="form" onSubmit={onSubmit} noValidate layerStyle="card" width="100%" maxW="400px">
      <Stack gap="6">
        <Heading as="h2" size="h2" textAlign="center" m="0">
          Ajouter un fichier
        </Heading>

        <Stack gap="1">
          <Flex direction="row" align="center" gap="4" h="56px" alignSelf="stretch">
            <Flex direction="row" align="center" p="2" gap="4" flex="1" h="56px" minW={0}>
              <Box flexShrink={0} w="24px" h="24px" color="form.darkText">
                <FilePlus size={24} />
              </Box>
              <Flex
                direction="column"
                justify="center"
                align="flex-start"
                flex="1"
                h="40px"
                minW={0}
              >
                <Text
                  textStyle="body"
                  color="form.darkText"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  w="100%"
                >
                  {file.name}
                </Text>
                <Text
                  textStyle="caption"
                  color={fileSizeError ? 'form.errorText' : 'form.darkText'}
                >
                  {formatFileSize(file.size)}
                </Text>
              </Flex>
            </Flex>

            <Button
              variant="outline"
              size="sm"
              h="32px"
              type="button"
              onClick={onChangeFile}
              flexShrink={0}
            >
              Changer
            </Button>
          </Flex>

          {fileSizeError && (
            <Text textStyle="body" color="form.errorText">
              La taille des fichiers est limitée à {maxFileSizeDisplay}
            </Text>
          )}
        </Stack>

        {uploadError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>{uploadError}</Alert.Title>
          </Alert.Root>
        )}

        <Button
          variant="surface"
          type="submit"
          disabled={fileSizeError || isUploading}
          loading={isUploading}
        >
          <CloudUpload />
          Téléverser
        </Button>
      </Stack>
    </Box>
  );
};

export default UploadForm;
