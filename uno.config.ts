import { defineConfig, presetAttributify, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'
import presetWebFonts from '@unocss/preset-web-fonts'

export default defineConfig({
  presets: [
    presetAttributify({ /* preset options */}),
    presetUno(),
    presetIcons({ /* options */ }),
    presetWebFonts({
      provider: 'bunny',
      fonts: {
        sans: 'Blinker:100,200,300,400,500,600,700,800,900',
        mono: ['Nova Mono'],
      },
    }),
  ],
})
