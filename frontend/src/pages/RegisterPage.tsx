import { Alert, Box, Button, Field, Flex, Heading, Input, Stack, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { register as registerUser } from '../api/users';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterPage() {
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerUser(data.email, data.password);
      setSubmissionStatus('success');
    } catch {
      setSubmissionStatus('error');
    }
  });

  return (
    <Flex as="main" flex="1" align="center" justify="center" px="4" width="100%">
      <Box as="form" onSubmit={onSubmit} noValidate layerStyle="card" width="100%" maxW="640px">
        <Stack gap="6" height="100%">
          <Heading as="h2" size="h2" textAlign="center" m="0">
            Créer un compte
          </Heading>
          <Stack gap="4" flex="1">
            <Field.Root required invalid={!!errors.email}>
              <Stack gap="2">
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  placeholder="Saisissez votre email..."
                  autoComplete="email"
                  {...register('email', {
                    required: "L'email est requis",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Le format de l'email est invalide",
                    },
                  })}
                />
                {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
              </Stack>
            </Field.Root>

            <Field.Root required invalid={!!errors.password}>
              <Stack gap="2">
                <Field.Label>Mot de passe</Field.Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Saisissez votre mot de passe..."
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: '8 caractères minimum',
                    },
                  })}
                />
                {errors.password && <Field.ErrorText>{errors.password.message}</Field.ErrorText>}
              </Stack>
            </Field.Root>

            <Field.Root required invalid={!!errors.confirmPassword}>
              <Stack gap="2">
                <Field.Label>Vérification du mot de passe</Field.Label>
                <Input
                  type="password"
                  placeholder="Saisissez le à nouveau"
                  {...register('confirmPassword', {
                    required: 'La confirmation est requise',
                    validate: (value) =>
                      value === password || 'Les mots de passe ne correspondent pas',
                  })}
                />
                {errors.confirmPassword && (
                  <Field.ErrorText>{errors.confirmPassword.message}</Field.ErrorText>
                )}
              </Stack>
            </Field.Root>
          </Stack>
          {submissionStatus === 'success' && (
            <Alert.Root status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>
                  Vous pouvez maintenant <Link to="/login">vous connecter</Link>.
                </Alert.Title>
              </Alert.Content>
            </Alert.Root>
          )}
          {submissionStatus === 'error' && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>Une erreur est survenue. Veuillez réessayer.</Alert.Title>
            </Alert.Root>
          )}
          <VStack spacing="2" align="stretch">
            <Button asChild variant="ghost">
              <Link to="/login">J'ai déjà un compte</Link>
            </Button>
            <Button variant="surface" type="submit" loading={isSubmitting}>
              Créer mon compte
            </Button>
          </VStack>
        </Stack>
      </Box>
    </Flex>
  );
}

export default RegisterPage;
