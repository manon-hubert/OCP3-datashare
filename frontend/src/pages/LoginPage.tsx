import { Alert, Box, Button, Field, Flex, Heading, Input, Stack, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login as loginUser } from '../api/users.ts';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await loginUser(data.email, data.password);
      login(token);
      void navigate('/');
    } catch {
      setSubmissionStatus('error');
    }
  });

  return (
    <Flex as="main" flex="1" align="center" justify="center" px="4" width="100%">
      <form onSubmit={onSubmit} noValidate style={{ width: '100%', maxWidth: '640px' }}>
        <Box layerStyle="card">
          <Stack gap="6" height="100%">
            <Heading as="h2" textStyle="h2" textAlign="center" m="0">
              Connexion
            </Heading>
            <Stack gap="4" flex="1">
              <Field.Root required invalid={!!errors.email}>
                <Stack gap="2">
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                    placeholder="Saisissez votre email..."
                    autoComplete="email"
                    data-testid="login-email"
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
                    data-testid="login-password"
                    {...register('password', {
                      required: 'Le mot de passe est requis',
                    })}
                  />
                  {errors.password && <Field.ErrorText>{errors.password.message}</Field.ErrorText>}
                </Stack>
              </Field.Root>
            </Stack>
            {submissionStatus === 'error' && (
              <Alert.Root status="error" data-testid="login-error">
                <Alert.Indicator />
                <Alert.Title>Email ou mot de passe incorrect.</Alert.Title>
              </Alert.Root>
            )}
            <VStack gap="2" align="stretch">
              <Button asChild variant="ghost">
                <Link to="/register">Créer un compte</Link>
              </Button>
              <Button
                variant="surface"
                type="submit"
                loading={isSubmitting}
                data-testid="login-submit"
              >
                Connexion
              </Button>
            </VStack>
          </Stack>
        </Box>
      </form>
    </Flex>
  );
}

export default LoginPage;
