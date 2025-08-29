import { config as defaultConfig } from '@gluestack-ui/config';

export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      bgDark: '#121212',
      surfaceDark: '#1e1e1e',
      accent: '#e74c3c',
      textLight: '#fff',
      textSubtle: '#888',
    },
    radii: {
      ...defaultConfig.tokens.radii,
      sm: 4,
      md: 8,
      lg: 12,
    },
    fontSizes: {
      ...defaultConfig.tokens.fontSizes,
      sm: 14,
      md: 16,
      lg: 20,
    },
  },
};
