import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        doneDeals: resolve(__dirname, 'done-deals/index.html'),
        aydinTower: resolve(__dirname, 'done-deals/aydin-tower/index.html'),
        pearlTower: resolve(__dirname, 'done-deals/pearl-tower/index.html'),
        aydinsHeaven: resolve(__dirname, 'done-deals/aydins-heaven/index.html'),
        gardenCity: resolve(__dirname, 'done-deals/garden-city/index.html'),
        services: resolve(__dirname, 'services/index.html'),
        meetTheTeam: resolve(__dirname, 'meet-the-team/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
      }
    }
  }
});
