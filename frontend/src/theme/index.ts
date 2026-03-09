import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { tokens } from './tokens';
import { layerStyles, textStyles } from './styles';
import { buttonRecipe, headingRecipe, inputRecipe } from './recipes';
import { fieldSlotRecipe, alertSlotRecipe, tabsSlotRecipe, menuSlotRecipe } from './slot-recipes';

const config = defineConfig({
  theme: {
    tokens,
    layerStyles,
    textStyles,
    recipes: {
      button: buttonRecipe,
      heading: headingRecipe,
      input: inputRecipe,
    },
    slotRecipes: {
      field: fieldSlotRecipe,
      alert: alertSlotRecipe,
      tabs: tabsSlotRecipe,
      menu: menuSlotRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
