import { serve } from '@hono/node-server'; // Import the Hono serve function
import app from './app.js';

serve(app, (info) => {
  console.log(`Server is running on ${info.address}`);
});
