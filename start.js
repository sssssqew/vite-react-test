import * as esbuild from 'esbuild'
import detect from 'detect-port'
import chalk from 'chalk'
import { envPlugin } from './plugins.js'
import dotenv from 'dotenv'
dotenv.config() 

const port = 8000
const onRequest = (args) => {
    const { remoteAddress, method, path, status, timeInMS } = args
    console.log(`${remoteAddress} - "${method} ${path}" ${(status === 404 || status === 500) ? chalk.red(status) : chalk.green(status)} [${timeInMS}ms]`) 
}

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
    .context({
        entryPoints: ['src/index.js'],
        bundle: true, 
        minify: true,
        outfile: 'build/bundle.js',
        loader: { '.js': 'jsx', '.png': 'file', '.jpg': 'file', '.svg': 'file'},
        format: 'cjs',
        sourcemap: true,
        logLevel: 'info',
        plugins: [envPlugin],
    })
    .then(async (ctx) => {
        console.log('⚡ Bundle build complete ⚡')
        await ctx.watch()
        
        detect(port).then(async _port => { // detect if port is available first 
            if (port == _port) {
                console.log(`port: ${port} was not occupied`)
                await ctx.serve({ servedir: 'build', fallback: `build/index.html`, onRequest })
              } else {
                console.log(`port: ${port} was occupied, try port: ${_port}`)
                await ctx.serve({ servedir: 'build', port: _port, fallback: `build/index.html`, onRequest })
              }
        })
    })
    .catch(e => {
        console.log('❌Failed to bundle ❌')
        console.log(e)
        process.exit(1)
    })