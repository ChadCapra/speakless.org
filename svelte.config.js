// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({
            // This is the directory GitHub Pages will use.
            // It's 'build' by default, which matches your expectation.
            pages: 'build',
            assets: 'build',
            fallback: null, // Use null for a multi-page static site. Use 'index.html' for an SPA.
            precompress: false,
            strict: true
        }),
        paths: {
            // IMPORTANT: Change 'my-app' to your GitHub repo name.
            // This tells SvelteKit to build all paths relative to /my-app/
            base: process.env.NODE_ENV === 'production' ? '/speakless.org' : ''
        }
    }
};

export default config;
