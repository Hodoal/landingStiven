require('dotenv').config();
const app = require('./server');

const PORT = process.env.PORT || 5002;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});
