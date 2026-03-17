import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  IconButton,
  Pagination,
  Spinner,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import {
  listFiles,
  listFileHistory,
  deleteFile,
  type FileListItem,
  type FileHistoryItem,
} from '../api/files';
import { FileRow } from '../components/dashboard/FileRow';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 20;

type Tab = 'all' | 'active' | 'expired';

function MyFilesPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [history, setHistory] = useState<FileHistoryItem[]>([]);
  const [filesTotal, setFilesTotal] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFiles([]);
    setHistory([]);
    if (tab === 'all') {
      Promise.all([
        listFiles('all', page, PAGE_SIZE),
        listFileHistory(page, PAGE_SIZE),
      ])
        .then(([f, h]) => {
          setFiles(f.data);
          setFilesTotal(f.total);
          setHistory(h.data);
          setHistoryTotal(h.total);
        })
        .catch(() => setError('Impossible de charger les fichiers.'))
        .finally(() => setLoading(false));
    } else if (tab === 'expired') {
      Promise.all([
        listFiles('expired', page, PAGE_SIZE),
        listFileHistory(page, PAGE_SIZE),
      ])
        .then(([f, h]) => {
          setFiles(f.data);
          setFilesTotal(f.total);
          setHistory(h.data);
          setHistoryTotal(h.total);
        })
        .catch(() => setError("Impossible de charger l'historique."))
        .finally(() => setLoading(false));
    } else {
      listFiles(tab, page, PAGE_SIZE)
        .then((res) => {
          setFiles(res.data);
          setFilesTotal(res.total);
        })
        .catch(() => setError('Impossible de charger les fichiers.'))
        .finally(() => setLoading(false));
    }
  }, [tab, page]);

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setPage(1);
  }

  async function handleDelete(id: string) {
    try {
      await deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      const message = (e as { error?: { message?: string } })?.error?.message;
      setError(message ?? 'Impossible de supprimer le fichier.');
    }
  }

  const total =
    tab === 'active' ? filesTotal : Math.max(filesTotal, historyTotal);

  const isEmpty =
    tab === 'all'
      ? files.length === 0 && history.length === 0
      : tab === 'expired'
        ? files.length === 0 && history.length === 0
        : files.length === 0;

  const navigate = useNavigate();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <Box>
      <Flex direction="row" align="center" justify="space-between" mb="6">
        <Heading as="h2" textStyle="h2" data-testid="my-files-heading">
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
        onValueChange={(e: { value: string }) =>
          handleTabChange(e.value as Tab)
        }
        variant="enclosed"
        mb="6"
      >
        <Tabs.List>
          <Tabs.Trigger value="all" data-testid="tab-all">
            Tous
          </Tabs.Trigger>
          <Tabs.Trigger value="active" data-testid="tab-active">
            Actifs
          </Tabs.Trigger>
          <Tabs.Trigger value="expired" data-testid="tab-expired">
            Expiré
          </Tabs.Trigger>
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
          {files.map((file) =>
            new Date(file.expiresAt) < startOfToday ? (
              <FileRow key={file.id} kind="expired" file={file} />
            ) : (
              <FileRow
                key={file.id}
                kind="active"
                file={file}
                onDelete={handleDelete}
              />
            ),
          )}
          {tab !== 'active' &&
            history.map((item) => (
              <FileRow key={item.id} kind="history" item={item} />
            ))}
        </Flex>
      )}

      {total > PAGE_SIZE && (
        <Pagination.Root
          count={total}
          pageSize={PAGE_SIZE}
          page={page}
          onPageChange={(e) => setPage(e.page)}
          mt="6"
        >
          <ButtonGroup variant="ghost" size="sm" alignItems="center">
            <Pagination.PrevTrigger asChild>
              <IconButton aria-label="Page précédente">
                <LuChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>
            <Pagination.PageText
              format="short"
              textStyle="small"
              color="black"
            />
            <Pagination.NextTrigger asChild>
              <IconButton aria-label="Page suivante">
                <LuChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      )}
    </Box>
  );
}

export default MyFilesPage;
