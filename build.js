import * as esbuild from 'esbuild'
import fs from 'node:fs'
import { envPlugin } from './plugins.js'
import dotenv from 'dotenv'
dotenv.config() 

// html 
esbuild
    .build({
        entryPoints: ['public/index.html'],
        outfile: 'build/index.html',
        loader: { '.html': 'copy' }
    })
    .then(() => console.log('⚡ Bundle build complete ⚡'))
    .catch(e => {
        console.log('❌Failed to bundle ❌')
        console.log(e)
        process.exit(1)
    })

// js, css, files 
esbuild
    .build({
        entryPoints: ['src/index.js'],
        bundle: true, 
        minify: true,
        outfile: 'build/bundle.js',
        loader: { '.js': 'jsx', '.png': 'file', '.jpg': 'file', '.svg': 'file'},
        format: 'cjs',
        metafile: true,
        logLevel: 'info',
        plugins: [envPlugin],
    })
    .then(async (result) => {
        console.log('⚡ Bundle build complete ⚡')
        console.log(await esbuild.analyzeMetafile(result.metafile))
        fs.writeFileSync('meta.json', JSON.stringify(result.metafile))
    })
    .catch(e => {
        console.log('❌Failed to bundle ❌')
        console.log(e)
        process.exit(1)
    })