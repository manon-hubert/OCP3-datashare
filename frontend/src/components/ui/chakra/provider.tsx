'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme.ts';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode.tsx';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
