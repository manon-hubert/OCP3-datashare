import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    textDecoration: 'none',
    fontFamily: 'DM Sans Variable',
    fontWeight: '400',
  },
  variants: {
    variant: {
      ghost: {
        background: 'transparent',
        color: '{colors.button.orange}',
        _hover: {
          background: 'transparent',
        },
      },
      outline: {
        background: 'transparent',
        border: '1px solid',
        borderColor: '{colors.button.orangeLight}',
        color: '{colors.button.orange}',
        _hover: {
          background: 'transparent',
        },
      },
      surface: {
        background: '{colors.button.orangeSubtle}',
        border: '1px solid',
        borderColor: '{colors.button.orangeBorder}',
        color: '{colors.button.orangeDark}',
        boxShadow: 'none',
        _hover: {
          background: '{colors.button.orangeSubtle}',
        },
      },
      solid: {
        background: '{colors.button.darkBg}',
        color: '{colors.button.darkText}',
        _hover: {
          background: '{colors.button.darkBg}',
        },
      },
    },
    size: {
      sm: { px: '12px', py: '8px', fontSize: '16px', height: '32px' },
      md: { px: '12px', py: '12px', fontSize: '16px', height: '40px' },
    },
  },
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
  },
});

export const headingRecipe = defineRecipe({
  base: { color: 'black' },
});

export const inputRecipe = defineRecipe({
  base: {
    fontFamily: 'DM Sans Variable',
    fontWeight: '400',
    fontSize: '16px',
    color: '{colors.form.darkText}',
    border: '1px solid',
    borderRadius: '8px',
    height: '40px',
    px: '16px',
    py: '12px',
    _placeholder: {
      fontFamily: 'DM Sans Variable',
      fontSize: '16px',
      color: '{colors.form.lightText}',
    },
    _autofill: {
      transition: 'background-color 0s 600000s, color 0s 600000s',
    },
  },
  variants: {
    variant: {
      outline: {
        borderColor: '{colors.form.lightBorder}',
      },
    },
  },
});
