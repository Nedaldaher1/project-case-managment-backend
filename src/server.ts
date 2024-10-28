import { serve } from '@hono/node-server'; // Import the Hono serve function
import app from './app.js';


const PORT = parseInt(process.env.PORT || '4000', 10); // You can change the default port here

serve({
  fetch: app.fetch,
  port: PORT,
})

serve(app, (info) => {
  console.log(`Server is running on ${info.address}`);
});
