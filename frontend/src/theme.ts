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
      sm: { px: '12px', py: '8px', fontSize: '16px', height: '32px' },
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
const tabsSlotRecipe = defineSlotRecipe({
  slots: ['root', 'list', 'trigger', 'content', 'indicator'],
  variants: {
    variant: {
      enclosed: {
        list: {
          bg: '{colors.filterTabs.listBg}',
          border: '1px solid',
          borderColor: '{colors.filterTabs.listBorder}',
          borderRadius: '24px',
          padding: '0',
          gap: '0',
          height: '32px',
          overflow: 'hidden',
        },
        trigger: {
          px: '16px',
          py: '8px',
          fontSize: '16px',
          fontWeight: '400',
          fontFamily: 'DM Sans Variable',
          color: '{colors.filterTabs.inactiveText}',
          height: '100%',
          borderRadius: '0',
          border: 'none',
          _selected: {
            bg: '{colors.filterTabs.activeBg}',
            color: '{colors.filterTabs.activeText}',
            border: 'none',
            boxShadow: 'none',
          },
        },
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
        filterTabs: {
          listBg: { value: 'rgba(255, 193, 145, 0.16)' },
          listBorder: { value: 'rgba(215, 99, 11, 0.2)' },
          activeBg: { value: '#E77A6E' },
          activeText: { value: '#FFFFFF' },
          inactiveText: { value: '#000000' },
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
        dashboard: {
          header: {
            bg: { value: '#FFEEE3' },
            border: { value: 'rgba(216, 97, 28, 0.29)' },
          },
          sidebar: {
            bg: { value: 'linear-gradient(172.84deg, #FFB88C 2.29%, #DE6262 97.71%)' },
            border: { value: 'rgba(98, 54, 26, 0.15)' },
            activeNavBg: { value: 'rgba(255, 255, 255, 0.4)' },
            activeNavText: { value: '#803A00' },
            copyright: { value: '#F1E9E2' },
          },
          navItem: {
            activeBg: { value: 'rgba(255, 255, 255, 0.4)' },
            activeText: { value: '#803A00' },
            inactiveBg: { value: 'transparent' },
            inactiveText: { value: '#B87A50' },
          },
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
      accent: {
        value: {
          fontFamily: 'DM Sans Variable, sans-serif',
          fontWeight: '600',
          fontSize: '16px',
          lineHeight: '24px',
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
      tabs: tabsSlotRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
