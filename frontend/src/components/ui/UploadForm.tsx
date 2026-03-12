import {
  Alert,
  Box,
  Button,
  Flex,
  FormatByte,
  Heading,
  Select,
  Stack,
  Text,
  createListCollection,
} from '@chakra-ui/react';
import { CloudUpload, FilePlus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { TTL_OPTIONS } from '../../constants/ttl.ts';

const ttlCollection = createListCollection({
  items: TTL_OPTIONS.map(({ days, label }) => ({ value: String(days), label })),
});

interface UploadFormData {
  fileName: string;
  ttlDays: string;
}

interface UploadFormProps {
  file: File;
  fileSizeError?: boolean;
  isUploading?: boolean;
  uploadError?: string;
  onChangeFile: () => void;
  onUpload: (ttlDays: number) => void;
}

const UploadForm = ({
  file,
  fileSizeError,
  isUploading,
  uploadError,
  onChangeFile,
  onUpload,
}: UploadFormProps) => {
  const { handleSubmit, control } = useForm<UploadFormData>({
    defaultValues: { fileName: file.name, ttlDays: '7' },
  });

  const onSubmit = handleSubmit(({ ttlDays }) => {
    onUpload(Number(ttlDays));
  });

  return (
    <form onSubmit={onSubmit} noValidate style={{ width: '100%' }}>
      <Box
        layerStyle="card"
        width="100%"
        maxW={{ base: '100%', md: '400px' }}
        mx="auto"
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
                    textStyle="normal"
                    color="form.darkText"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    w="100%"
                  >
                    {file.name}
                  </Text>
                  <Text
                    textStyle="small"
                    color={fileSizeError ? 'form.errorText' : 'form.darkText'}
                  >
                    <FormatByte value={file.size} unitDisplay="short" unitSystem="decimal" />
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
              <Text textStyle="normal" color="form.errorText">
                La taille des fichiers est limitée à{' '}
                <FormatByte
                  value={Number(import.meta.env.VITE_MAX_FILE_SIZE)}
                  unitDisplay="short"
                  unitSystem="decimal"
                />
              </Text>
            )}
          </Stack>

          <Controller
            control={control}
            name="ttlDays"
            render={({ field }) => (
              <Select.Root
                collection={ttlCollection}
                value={[field.value]}
                onValueChange={({ value }) => field.onChange(value[0])}
                onInteractOutside={() => field.onBlur()}
              >
                <Select.HiddenSelect />
                <Select.Label>Expiration</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {ttlCollection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            )}
          />

          {uploadError && (
            <Alert.Root status="error" size="sm">
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
    </form>
  );
};

export default UploadForm;
