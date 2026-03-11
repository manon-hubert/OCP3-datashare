import { useEffect, useState } from 'react';
import { Alert, Box, Button, Flex, Heading, Spinner, Tabs, Text } from '@chakra-ui/react';
import {
  listFiles,
  listFileHistory,
  deleteFile,
  type FileListItem,
  type FileHistoryItem,
} from '../api/files';
import { FileRow } from '../components/dashboard/FileRow';
import { useNavigate } from 'react-router-dom';

type Tab = 'all' | 'active' | 'expired';

function MyFilesPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [history, setHistory] = useState<FileHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFiles([]);
    setHistory([]);
    if (tab === 'all') {
      Promise.all([listFiles('all'), listFileHistory()])
        .then(([f, h]) => {
          setFiles(f);
          setHistory(h);
        })
        .catch(() => setError('Impossible de charger les fichiers.'))
        .finally(() => setLoading(false));
    } else if (tab === 'expired') {
      Promise.all([listFiles('expired'), listFileHistory()])
        .then(([f, h]) => {
          setFiles(f);
          setHistory(h);
        })
        .catch(() => setError("Impossible de charger l'historique."))
        .finally(() => setLoading(false));
    } else {
      listFiles(tab)
        .then(setFiles)
        .catch(() => setError('Impossible de charger les fichiers.'))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  async function handleDelete(id: string) {
    try {
      await deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      const message = (e as { error?: { message?: string } })?.error?.message;
      setError(message ?? 'Impossible de supprimer le fichier.');
    }
  }

  const isEmpty =
    tab === 'all'
      ? files.length === 0 && history.length === 0
      : tab === 'expired'
        ? history.length === 0
        : files.length === 0;

  const navigate = useNavigate();

  return (
    <Box>
      <Flex direction="row" align="center" justify="space-between" mb="6">
        <Heading as="h2" textStyle="h2">
          Mes fichiers
        </Heading>
        <Button
          variant="solid"
          size="sm"
          display={{ base: 'flex', md: 'none' }}
          onClick={() => navigate('/')}
        >
          Ajouter
        </Button>
      </Flex>

      <Tabs.Root
        value={tab}
        onValueChange={(e: { value: string }) => setTab(e.value as Tab)}
        variant="enclosed"
        mb="6"
      >
        <Tabs.List>
          <Tabs.Trigger value="all">Tous</Tabs.Trigger>
          <Tabs.Trigger value="active">Actifs</Tabs.Trigger>
          <Tabs.Trigger value="expired">Expiré</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {error && (
        <Alert.Root status="error" mb="4">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      {loading ? (
        <Spinner size="xl" color="orange.500" borderWidth="4px" />
      ) : isEmpty ? (
        <Text textStyle="small" color="{colors.fileRow.text}">
          Aucun fichier à afficher.
        </Text>
      ) : (
        <Flex direction="column" gap="3">
          {files.map((file) => (
            <FileRow key={file.id} kind="active" file={file} onDelete={handleDelete} />
          ))}
          {tab !== 'active' &&
            history.map((item) => <FileRow key={item.id} kind="history" item={item} />)}
        </Flex>
      )}
    </Box>
  );
}

export default MyFilesPage;
