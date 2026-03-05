'use client';

import { ChakraProvider, LocaleProvider as ChakraLocaleProvider } from '@chakra-ui/react';
import { system } from '../../../theme.ts';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode.tsx';
import type { FC, ReactNode } from 'react';

// LocaleProvider's children prop is lost in TypeScript's type resolution due to npm hoisting:
// @ark-ui/react (re-exported by @chakra-ui/react) lives at root node_modules where @types/react is unreachable.
const LocaleProvider = ChakraLocaleProvider as FC<{ locale: string; children: ReactNode }>;

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <LocaleProvider locale="fr-FR">
        <ColorModeProvider {...props} />
      </LocaleProvider>
    </ChakraProvider>
  );
}
