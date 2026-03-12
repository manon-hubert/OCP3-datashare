import { Box, Button, Flex, IconButton, Menu, Portal, Text } from '@chakra-ui/react';
import { File as FileIcon, Trash2, ArrowRight, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FileListItem, FileHistoryItem } from '../../api/files';
import { formatExpiry } from '../../utils/formatExpiry';

export type FileRowProps =
  | { kind: 'active'; file: FileListItem; onDelete: (id: string) => void }
  | { kind: 'history'; item: FileHistoryItem };

export function FileRow(props: FileRowProps) {
  const name = props.kind === 'active' ? props.file.originalName : props.item.originalName;
  const subtitle = props.kind === 'active' ? formatExpiry(props.file.expiresAt) : `Expiré`;
  const deleted = props.kind === 'history';

  return (
    <Flex
      data-testid="file-row"
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
        <>
          {/* Desktop buttons */}
          <Flex align="center" gap="3" flexShrink={0} display={{ base: 'none', md: 'flex' }}>
            <Button
              variant="outline"
              size="sm"
              gap="2"
              data-testid="file-delete-button"
              onClick={() => props.onDelete(props.file.id)}
            >
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

          {/* Mobile kebab menu */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="Actions"
                variant="outline"
                display={{ base: 'flex', md: 'none' }}
                w="32px"
                h="32px"
                minW="32px"
                p="8px"
                borderColor="{colors.button.orangeLight}"
                borderRadius="8px"
                color="{colors.button.orange}"
                _open={{
                  bg: 'transparent',
                  color: '{colors.button.orange}',
                  borderColor: '{colors.button.orangeLight}',
                }}
              >
                <MoreVertical size={16} />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content bg="white" borderRadius="8px">
                  <Menu.Item
                    value="access"
                    asChild
                    color="black"
                    _highlighted={{ bg: '{colors.dashboard.header.bg}', borderRadius: '8px' }}
                  >
                    <Link to={`/share/${props.file.downloadToken}`}>Accéder</Link>
                  </Menu.Item>
                  <Menu.Item
                    value="delete"
                    color="{colors.fileRow.expiredText}"
                    _highlighted={{ bg: '{colors.dashboard.header.bg}', borderRadius: '8px' }}
                    onClick={() => props.onDelete(props.file.id)}
                  >
                    Supprimer
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </>
      )}
    </Flex>
  );
}
