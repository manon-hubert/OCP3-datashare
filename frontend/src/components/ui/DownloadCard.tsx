import { Alert, Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { CloudDownload, FileImage } from 'lucide-react';
import type { FileInfo } from '../../api/files';
import { formatFileSize } from './UploadForm';

const FILE_LIFETIME_DAYS = 7;

function getExpiryAlert(createdAt: string): {
  status: 'info' | 'warning' | 'error';
  message: string;
} {
  const expires = new Date(
    new Date(createdAt).getTime() + FILE_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
  );
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const expiryDay = new Date(expires.getFullYear(), expires.getMonth(), expires.getDate());

  if (expiryDay < today) {
    return {
      status: 'error',
      message: "Ce fichier n'est plus disponible en téléchargement car il a expiré",
    };
  }
  if (expiryDay.getTime() === today.getTime()) {
    return { status: 'warning', message: 'Ce fichier expirera ce soir' };
  }
  if (expiryDay.getTime() === tomorrow.getTime()) {
    return { status: 'warning', message: 'Ce fichier expirera demain' };
  }
  const daysLeft = Math.round((expiryDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return { status: 'info', message: `Ce fichier expirera dans ${daysLeft} jours` };
}

interface DownloadCardProps {
  fileInfo?: FileInfo;
  token: string;
}

const DownloadCard = ({ fileInfo, token }: DownloadCardProps) => {
  const expiry = fileInfo ? getExpiryAlert(fileInfo.createdAt) : null;
  const status = expiry?.status ?? 'error';
  const message =
    expiry?.message ?? "Ce fichier n'est plus disponible en téléchargement car il a expiré";
  const downloadUrl = `${import.meta.env.VITE_API_URL as string}/files/download/${token}/content`;
  const isExpired = status === 'error';

  return (
    <Box layerStyle="card" width="100%" maxW="640px">
      <Stack gap="6">
        <Heading as="h2" size="h2" textAlign="center" m="0">
          Télécharger un fichier
        </Heading>

        <Stack gap="4">
          {fileInfo && (
            <Flex direction="row" align="center" p="2" gap="4" h="56px">
              <Box flexShrink={0} w="24px" h="24px" color="form.darkText">
                <FileImage size={24} />
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
                  {fileInfo.originalName}
                </Text>
                <Text textStyle="caption" color="form.darkText">
                  {formatFileSize(fileInfo.size)}
                </Text>
              </Flex>
            </Flex>
          )}

          <Alert.Root status={status}>
            <Alert.Indicator />
            <Alert.Title>{message}</Alert.Title>
          </Alert.Root>
        </Stack>

        {!isExpired && (
          <Button variant="surface" asChild>
            <a href={downloadUrl} download>
              <CloudDownload />
              Télécharger
            </a>
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default DownloadCard;
