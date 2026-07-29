import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The brand theme is read straight out of design-system/pai.tailwind.js rather
// than copied, so tokens never drift from the design system. That file is
// written for the browser CDN (`tailwind.config = {...}`), so we run it with a
// stand-in `tailwind` object and take the theme back off it.
const here = path.dirname(fileURLToPath(import.meta.url))
const preset = fs.readFileSync(
  path.resolve(here, '../design-system/pai.tailwind.js'),
  'utf8',
)
const tailwind = {}
new Function('tailwind', preset)(tailwind)

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: tailwind.config?.theme ?? {},
  plugins: [],
}
