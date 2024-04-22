// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import presetWind from '@unocss/preset-wind'

export default defineConfig({
  theme: {
    colors: {
      primary: '#2F2F2F', // Dark grey used for text
      secondary: '#BFBFBF', // Light grey used for secondary text and borders
      light: '#FFFFFF', // White used for backgrounds
      dark: '#1A1A1A', // Very dark grey used for headers
      accent_light: '#4C566A', // Accent color used sparingly
    },
  },
  shortcuts: [
    ['table', 'w-full'],
    ['table-cell', 'px-3 py-2 border-b border-secondary']
  ],
  presets: [
    presetWind(),
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
})
