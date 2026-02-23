import { Box, Button, Field, Flex, Heading, Input, Stack, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function RegisterPage() {
  return (
    <Flex as="main" flex="1" align="center" justify="center" px="4" width="100%">
      <Box
        as="form"
        bg="white"
        borderRadius="16px"
        p="6"
        width="100%"
        maxW="640px"
        boxShadow="0px 0px 12px rgba(0, 0, 0, 0.25)"
      >
        <Stack gap="6" height="100%">
          <Heading
            as="h2"
            fontSize="28px"
            fontWeight="700"
            textAlign="center"
            lineHeight="40px"
            m="0"
          >
            Créer un compte
          </Heading>
          <Stack gap="4" flex="1">
            <Field.Root required>
              <Stack gap="2">
                <Field.Label>Email</Field.Label>
                <Input type="email" name="email" placeholder="Saisissez votre email..." />
              </Stack>
            </Field.Root>
            <Field.Root required>
              <Stack gap="2">
                <Field.Label>Mot de passe</Field.Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Saisissez votre mot de passe..."
                />
              </Stack>
            </Field.Root>
            <Field.Root required>
              <Stack gap="2">
                <Field.Label>Vérification du mot de passe</Field.Label>
                <Input
                  type="password"
                  name="password-confirm"
                  placeholder="Saisissez le à nouveau"
                />
              </Stack>
            </Field.Root>
          </Stack>
          <VStack spacing="2" align="stretch">
            <Button asChild variant="ghost">
              <Link to="/login">J'ai déjà un compte</Link>
            </Button>
            <Button variant="surface">Créer mon compte</Button>
          </VStack>
        </Stack>
      </Box>
    </Flex>
  );
}

export default RegisterPage;
