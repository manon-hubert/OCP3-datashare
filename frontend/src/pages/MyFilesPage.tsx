import { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Tabs, Text } from '@chakra-ui/react';
import { File as FileIcon, Lock, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listFiles, deleteFile, type FileListItem } from '../api/files';

type Filter = 'all' | 'active' | 'expired';

function formatExpiry(expiresAt: string): { label: string; expired: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiresAt);
  exp.setHours(0, 0, 0, 0);
  const diffDays = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Expiré', expired: true };
  if (diffDays === 0) return { label: "Expire aujourd'hui", expired: false };
  if (diffDays === 1) return { label: 'Expire demain', expired: false };
  return { label: `Expire dans ${diffDays} jours`, expired: false };
}

interface FileRowProps {
  file: FileListItem;
  onDelete: (id: string) => void;
}

function FileRow({ file, onDelete }: FileRowProps) {
  const { label, expired } = formatExpiry(file.expiresAt);

  return (
    <Flex
      align="center"
      bg="white"
      border="1px solid"
      borderColor="#ECDDD5"
      borderRadius="12px"
      px="5"
      py="4"
      gap="4"
    >
      <Box color="#5A4A42" flexShrink={0}>
        <FileIcon size={24} strokeWidth={1.5} />
      </Box>

      <Box flex="1" minW="0">
        <Text
          fontFamily="DM Sans Variable"
          fontWeight="500"
          fontSize="15px"
          color="#1E1E1E"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {file.originalName}
        </Text>
        <Text
          fontFamily="DM Sans Variable"
          fontSize="13px"
          color={expired ? '#E27F29' : '#6B5B55'}
          mt="0.5"
        >
          {label}
        </Text>
      </Box>

      {expired ? (
        <Text fontFamily="DM Sans Variable" fontSize="14px" color="#A89890" flexShrink={0}>
          Ce fichier à expiré, il n&apos;est plus stocké chez nous
        </Text>
      ) : (
        <Flex align="center" gap="3" flexShrink={0}>
          <Box color="#A89890">
            <Lock size={16} />
          </Box>
          <Button variant="outline" size="sm" gap="2" onClick={() => onDelete(file.id)}>
            <Trash2 size={14} />
            Supprimer
          </Button>
          <Button asChild variant="outline" size="sm" gap="2">
            <Link to={`/share/${file.downloadToken}`}>
              Accéder
              <ArrowRight size={14} />
            </Link>
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

function MyFilesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listFiles(filter)
      .then(setFiles)
      .catch(() => setError('Impossible de charger les fichiers.'))
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleDelete(id: string) {
    try {
      await deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError('Impossible de supprimer le fichier.');
    }
  }

  return (
    <Box>
      <Heading as="h2" size="h2" mb="6">
        Mes fichiers
      </Heading>

      <Tabs.Root
        value={filter}
        onValueChange={(e: { value: string }) => setFilter(e.value as Filter)}
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
        <Text color="red.500" mb="4" fontFamily="DM Sans Variable" fontSize="14px">
          {error}
        </Text>
      )}

      {loading ? (
        <Text fontFamily="DM Sans Variable" color="#6B5B55">
          Chargement…
        </Text>
      ) : files.length === 0 ? (
        <Text fontFamily="DM Sans Variable" color="#6B5B55">
          Aucun fichier à afficher.
        </Text>
      ) : (
        <Flex direction="column" gap="3">
          {files.map((file) => (
            <FileRow key={file.id} file={file} onDelete={handleDelete} />
          ))}
        </Flex>
      )}
    </Box>
  );
}

export default MyFilesPage;
