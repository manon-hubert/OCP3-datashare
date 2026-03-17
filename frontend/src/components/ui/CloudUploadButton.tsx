import { Box, useToken } from '@chakra-ui/react';
import { CloudUpload } from 'lucide-react';

const CloudUploadButton = ({ onClick }: { onClick?: () => void }) => {
  const [cloudUploadIcon] = useToken('colors', ['cloudUploadButton.icon']);
  return (
    <Box
      borderRadius="full"
      bg="cloudUploadButton.ring"
      width="144px"
      height="144px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        borderRadius="full"
        bg="cloudUploadButton.inner"
        width="96px"
        height="96px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <button
          aria-label="Sélectionner un fichier à envoyer"
          onClick={onClick}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <CloudUpload size={48} color={cloudUploadIcon} strokeWidth={2} />
        </button>
      </Box>
    </Box>
  );
};

export default CloudUploadButton;
