import app from './app.ts';

const port = parseInt(process.env.PORT || '3000', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});