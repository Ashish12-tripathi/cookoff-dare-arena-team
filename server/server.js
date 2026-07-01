const app = require('./src/app');
const connectDB = require('./src/config/db');
const PORT = process.env.PORT || 3001;
connectDB();
app.listen(PORT, () => console.log(`Cook-Off Dare Arena server running on port ${PORT}`));
