import { type ChangeEvent, useRef, useState } from 'react';
import { Flex, Heading, VStack } from '@chakra-ui/react';
import CloudUploadButton from '../components/ui/CloudUploadButton';
import UploadForm from '../components/ui/UploadForm';
import UploadSuccessCard from '../components/ui/UploadSuccessCard';
import { uploadFile, type UploadedFile } from '../api/files';

const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE);

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadedTtlDays, setUploadedTtlDays] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileSizeError(file.size > MAX_FILE_SIZE);
      setUploadError(undefined);
      setUploadedFile(null);
    }
    e.target.value = '';
  };

  const handleUpload = async (ttlDays: number) => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(undefined);
    try {
      const result = await uploadFile(selectedFile, ttlDays);
      setUploadedFile(result);
      setUploadedTtlDays(ttlDays);
      setSelectedFile(null);
    } catch (err) {
      const apiMessage =
        typeof err === 'object' && err !== null
          ? (err as { error?: { message?: string } }).error?.message
          : undefined;
      setUploadError(
        apiMessage ?? 'Une erreur est survenue lors du téléversement. Veuillez réessayer.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const renderContent = () => {
    if (uploadedFile) {
      return <UploadSuccessCard uploadedFile={uploadedFile} ttlDays={uploadedTtlDays} />;
    }
    if (selectedFile) {
      return (
        <UploadForm
          file={selectedFile}
          fileSizeError={fileSizeError}
          isUploading={isUploading}
          uploadError={uploadError}
          onChangeFile={openFilePicker}
          onUpload={handleUpload}
        />
      );
    }
    return (
      <VStack gap="4">
        <Heading size="xl" textAlign="center" m="0">
          Tu veux partager un fichier ?
        </Heading>
        <CloudUploadButton onClick={openFilePicker} />
      </VStack>
    );
  };

  return (
    <Flex
      as="main"
      flex="1"
      align="center"
      justify="center"
      px={{ base: '0', md: '4' }}
      width="100%"
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        data-testid="file-input"
      />
      {renderContent()}
    </Flex>
  );
};

export default HomePage;
