import { Flex, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFileInfo, type FileInfo } from '../api/files';
import DownloadCard from '../components/ui/DownloadCard';

const DownloadPage = () => {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    getFileInfo(token)
      .then(setFileInfo)
      .catch(() => setNotFound(true));
  }, [token]);

  return (
    <Flex
      as="main"
      flex="1"
      align="center"
      justify="center"
      px="4"
      width="100%"
    >
      {notFound ? (
        <DownloadCard token={token ?? ''} />
      ) : fileInfo ? (
        <DownloadCard fileInfo={fileInfo} token={token!} />
      ) : (
        <Spinner role="status" aria-label="Chargement du fichier…" />
      )}
    </Flex>
  );
};

export default DownloadPage;
