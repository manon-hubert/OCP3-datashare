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
  slots: ['label', 'errorText'],
  base: {
    label: {
      color: '{colors.form.darkText}',
      fontFamily: 'Inter Variable',
      fontWeight: '400',
      fontSize: '16px',
      lineHeight: '24px',
    },
    errorText: {
      color: '{colors.form.errorText}',
      fontFamily: 'DM Sans Variable',
      fontWeight: 'normal',
      fontSize: '14px',
      lineHeight: '16px',
    },
    // errorText: {
    //   color: '{colors.form.errorText}',
    //   fontFamily: 'Inter Variable',
    //   fontWeight: '400',
    //   fontSize: '16px',
    //   lineHeight: '24px',
    // },
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
const alertSlotRecipe = defineSlotRecipe({
  slots: ['root', 'indicator', 'title', 'description', 'content'],
  base: {
    title: {
      fontFamily: 'DM Sans Variable',
      fontSize: '14px',
      fontWeight: '400',
    },
    content: {
      padding: '8px',
    },
  },
  compoundVariants: [
    {
      status: 'success',
      css: {
        root: { bg: '{colors.alert.success.bg}', padding: '8px', alignItems: 'center' },
        indicator: { color: '{colors.alert.success.text}' },
        title: { color: '{colors.alert.success.text}' },
        description: { color: '{colors.alert.success.text}' },
      },
    },
    {
      status: 'error',
      css: {
        root: { bg: '{colors.alert.error.bg}', padding: '8px', alignItems: 'center' },
        indicator: { color: '{colors.alert.error.text}' },
        title: { color: '{colors.alert.error.text}' },
        description: { color: '{colors.alert.error.text}' },
      },
    },
    {
      status: 'info',
      css: {
        root: { bg: '{colors.alert.info.bg}', padding: '8px', alignItems: 'center' },
        indicator: { color: '{colors.alert.info.text}' },
        title: { color: '{colors.alert.info.text}' },
        description: { color: '{colors.alert.info.text}' },
      },
    },
    {
      status: 'warning',
      css: {
        root: { bg: '{colors.alert.warning.bg}', padding: '8px', alignItems: 'center' },
        indicator: { color: '{colors.alert.warning.text}' },
        title: { color: '{colors.alert.warning.text}' },
        description: { color: '{colors.alert.warning.text}' },
      },
    },
  ],
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
          errorText: { value: '#F14343' },
          linkText: { value: '#D8640B' },
          urlBg: { value: 'rgba(255, 94, 0, 0.03)' },
          urlBorder: { value: 'rgba(215, 99, 11, 0.2)' },
        },
        alert: {
          success: {
            bg: { value: '#E8F5E9' },
            text: { value: '#2E7D32' },
          },
          error: {
            bg: { value: '#FFE2E2' },
            text: { value: '#9C3333' },
          },
          info: {
            bg: { value: '#E2ECFF' },
            text: { value: '#2A3F72' },
          },
          warning: {
            bg: { value: '#FFF5ED' },
            text: { value: '#AA642B' },
          },
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
    textStyles: {
      body: {
        value: {
          fontFamily: 'Inter Variable, sans-serif',
          fontWeight: '400',
          fontSize: '16px',
          lineHeight: '24px',
        },
      },
      caption: {
        value: {
          fontFamily: 'DM Sans Variable, sans-serif',
          fontWeight: '400',
          fontSize: '14px',
          lineHeight: '16px',
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
      alert: alertSlotRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
