import { defineSlotRecipe } from '@chakra-ui/react';

export const fieldSlotRecipe = defineSlotRecipe({
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
  },
});

export const tabsSlotRecipe = defineSlotRecipe({
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

export const alertSlotRecipe = defineSlotRecipe({
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
