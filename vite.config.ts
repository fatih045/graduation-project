
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})


import { defineConfig } from 'vite'


// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'https://evrenblackbird.com',
//         changeOrigin: true,
//         rewrite: path => path.replace(/^\/api/, ''),
//       },
//     },
//   },
// })
