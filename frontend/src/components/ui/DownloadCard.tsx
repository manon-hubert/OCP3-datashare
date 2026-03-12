import { Alert, Box, Button, Flex, FormatByte, Heading, Stack, Text } from '@chakra-ui/react';
import { CloudDownload, FileImage } from 'lucide-react';
import type { FileInfo } from '../../api/files';

function getExpiryAlert(expiresAt: string): {
  status: 'info' | 'warning' | 'error';
  message: string;
} {
  const now = new Date();
  const expires = new Date(expiresAt);
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryUtc = Date.UTC(expires.getFullYear(), expires.getMonth(), expires.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.round((expiryUtc - todayUtc) / msPerDay);

  if (daysLeft < 0)
    return {
      status: 'error',
      message: "Ce fichier n'est plus disponible en téléchargement car il a expiré",
    };
  if (daysLeft === 0) return { status: 'warning', message: 'Ce fichier expirera ce soir' };
  if (daysLeft === 1) return { status: 'warning', message: 'Ce fichier expirera demain' };
  return { status: 'info', message: `Ce fichier expirera dans ${daysLeft} jours` };
}

interface DownloadCardProps {
  fileInfo?: FileInfo;
  token: string;
}

const DownloadCard = ({ fileInfo, token }: DownloadCardProps) => {
  const expiry = fileInfo ? getExpiryAlert(fileInfo.expiresAt) : null;
  const status = expiry?.status ?? 'error';
  const message =
    expiry?.message ?? "Ce fichier n'est plus disponible en téléchargement car il a expiré";
  const downloadUrl = `${import.meta.env.VITE_API_URL as string}/files/download/${token}/content`;
  const isExpired = status === 'error';

  return (
    <Box layerStyle="card" width="100%" maxW="640px">
      <Stack gap="6">
        <Heading as="h2" textStyle="h2" textAlign="center" m="0">
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
                  textStyle="normal"
                  color="form.darkText"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  w="100%"
                >
                  {fileInfo.originalName}
                </Text>
                <Text textStyle="small" color="form.darkText">
                  <FormatByte value={fileInfo.size} unitDisplay="short" unitSystem="decimal" />
                </Text>
              </Flex>
            </Flex>
          )}

          <Alert.Root
            status={status}
            size="sm"
            {...(isExpired && { 'data-testid': 'expired-message' })}
          >
            <Alert.Indicator />
            <Alert.Title>{message}</Alert.Title>
          </Alert.Root>
        </Stack>

        {!isExpired && (
          <Button variant="surface" asChild data-testid="download-button">
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
