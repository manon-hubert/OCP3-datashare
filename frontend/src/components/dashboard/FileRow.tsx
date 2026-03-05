import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { File as FileIcon, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FileListItem, FileHistoryItem } from '../../api/files';

export function formatExpiry(expiresAt: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiresAt);
  exp.setHours(0, 0, 0, 0);
  const diffDays = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expiré';
  if (diffDays === 0) return "Expire aujourd'hui";
  if (diffDays === 1) return 'Expire demain';
  return `Expire dans ${diffDays} jours`;
}

export type FileRowProps =
  | { kind: 'active'; file: FileListItem; onDelete: (id: string) => void }
  | { kind: 'history'; item: FileHistoryItem };

export function FileRow(props: FileRowProps) {
  const name = props.kind === 'active' ? props.file.originalName : props.item.originalName;
  const subtitle = props.kind === 'active' ? formatExpiry(props.file.expiresAt) : `Expiré`;
  const deleted = props.kind === 'history';

  return (
    <Flex
      align="center"
      bg="{colors.fileRow.bg}"
      border="1px solid"
      borderColor="{colors.fileRow.border}"
      borderRadius="8px"
      px="4"
      py="2"
      gap="4"
    >
      <Box color="{colors.fileRow.icon}" flexShrink={0}>
        <FileIcon size={24} strokeWidth={1.5} />
      </Box>

      <Box flex="1" minW="0">
        <Text
          textStyle="accent"
          color="{colors.fileRow.text}"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {name}
        </Text>
        <Text
          textStyle="small"
          color={deleted ? '{colors.fileRow.expiredText}' : '{colors.fileRow.text}'}
        >
          {subtitle}
        </Text>
      </Box>

      {deleted ? (
        <Text textStyle="small" color="{colors.fileRow.mutedText}" flexShrink={0}>
          Ce fichier a expiré, il n&apos;est plus stocké chez nous
        </Text>
      ) : (
        <Flex align="center" gap="3" flexShrink={0}>
          {/*<Box color="#A89890">*/}
          {/*  <Lock size={16} />*/}
          {/*</Box>*/}
          <Button variant="outline" size="sm" gap="2" onClick={() => props.onDelete(props.file.id)}>
            <Trash2 size={14} />
            Supprimer
          </Button>
          <Button asChild variant="outline" size="sm" gap="2">
            <Link to={`/share/${props.file.downloadToken}`}>
              Accéder
              <ArrowRight size={14} />
            </Link>
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
