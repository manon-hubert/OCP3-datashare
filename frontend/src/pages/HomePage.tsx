import { type ChangeEvent, useRef, useState } from 'react';
import { Flex, Heading, VStack } from '@chakra-ui/react';
import CloudUploadButton from '../components/ui/CloudUploadButton';
import UploadForm from '../components/ui/UploadForm';

const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE);

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSizeError, setFileSizeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileSizeError(file.size > MAX_FILE_SIZE);
    }
    e.target.value = '';
  };

  const handleUpload = (_fileName: string) => {
    // TODO: wire to POST /files API
  };

  return (
    <Flex as="main" flex="1" align="center" justify="center" px="4" width="100%">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {selectedFile ? (
        <UploadForm
          file={selectedFile}
          fileSizeError={fileSizeError}
          onChangeFile={openFilePicker}
          onUpload={handleUpload}
        />
      ) : (
        <VStack gap="4">
          <Heading size="xl" textAlign="center" m="0">
            Tu veux partager un fichier ?
          </Heading>
          <CloudUploadButton onClick={openFilePicker} />
        </VStack>
      )}
    </Flex>
  );
};

export default HomePage;
