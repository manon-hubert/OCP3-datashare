import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe,
} from '@chakra-ui/react';

const buttonRecipe = defineRecipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    textDecoration: 'none',
    fontFamily: 'DM Sans Variable',
    fontWeight: 'regular',
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
      sm: { px: '12px', py: '8px', fontSize: '16px' },
      md: { px: '12px', py: '12px', fontSize: '16px', height: '40px' },
    },
  },
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
  },
});

const fieldSlotRecipe = defineSlotRecipe({
  slots: ['label'],
  base: {
    label: {
      color: '{colors.form.darkText}',
      fontFamily: 'Inter Variable',
      fontWeight: '400',
      fontSize: '16px',
      lineHeight: '24px',
    },
  },
});

const headingRecipe = defineRecipe({
  base: { color: 'black' },
  variants: {
    size: {
      h2: { fontSize: '28px', fontWeight: '700', lineHeight: '40px' },
      xl: { fontSize: '30px', fontWeight: '300', lineHeight: '40px' },
      h1: { fontSize: '32px', fontWeight: '700', lineHeight: '40px' },
    },
  },
});

const inputRecipe = defineRecipe({
  base: {
    fontFamily: 'DM Sans Variable',
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
  },
  variants: {
    variant: {
      outline: {
        borderColor: '{colors.form.lightBorder}',
      },
    },
  },
});

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        button: {
          orange: { value: '#E27F29' },
          orangeLight: { value: '#FFA569' },
          orangeDark: { value: '#BA681F' },
          orangeSubtle: { value: 'rgb(255, 129, 45, 0.13)' },
          orangeBorder: { value: 'rgb(205, 94, 20, 0.5)' },
          darkBg: { value: '#2C2C2C' },
          darkText: { value: '#F3EEEA' },
        },
        cloudUploadButton: {
          ring: { value: 'rgba(47, 25, 13, 0.15)' },
          inner: { value: '#100218' },
          icon: { value: '#FFEEEC' },
        },
        form: {
          darkText: { value: '#1E1E1E' },
          lightText: { value: '#B3B3B3' },
          lightBorder: { value: '#D9D9D9' },
        },
      },
      fonts: {
        heading: { value: 'DM Sans Variable, sans-serif' },
        text: { value: 'Inter Variable, sans-serif' },
      },
    },
    layerStyles: {
      card: {
        value: {
          background: 'white',
          borderRadius: '16px',
          padding: '6',
          boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    recipes: {
      button: buttonRecipe,
      heading: headingRecipe,
      input: inputRecipe,
    },
    slotRecipes: {
      field: fieldSlotRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
