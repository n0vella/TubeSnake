import preact from '@preact/preset-vite'
import { ConfigEnv, UserConfig, defineConfig } from 'vite'
import archiver from 'archiver'
import fs from 'fs'
import { name, version } from './manifest.json'
import tailwindcss from '@tailwindcss/vite'

async function createZip() {
  console.log('Creating zip')

  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true })
  }

  fs.mkdirSync('build')

  fs.cpSync('dist', 'build/dist', { recursive: true })
  fs.copyFileSync('manifest.json', 'build/manifest.json')
  fs.copyFileSync('icon.png', 'build/icon.png')

  if (!fs.existsSync('releases')) {
    fs.mkdirSync('releases')
  }

  const outputFile = `releases/${name}_${version}.xpi`
  const output = fs.createWriteStream(outputFile)
  const archive = archiver('zip')

  archive.pipe(output)
  archive.directory('build', false)
  archive.finalize()

  console.log(`Zip saved on ${outputFile}`)
}

export default defineConfig((mode: ConfigEnv): UserConfig => {
  return {
    plugins: [
      tailwindcss(),
      preact(),
      {
        name: 'Create Zip',
        writeBundle: process.env.WATCH ? undefined : createZip,
      },
    ],
    build: {
      target: 'esnext',
      minify: true,
      outDir: 'dist',
      lib: {
        entry: 'src/index.tsx',
        name: 'index',
        fileName: () => 'index.js',
        formats: ['iife'],
      },
    },
    define: {
      // https://github.com/vitejs/vite/discussions/13587
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  }
})
