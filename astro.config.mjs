import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: netlify(),
	integrations: [mdx()],
});
