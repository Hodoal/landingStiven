module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Test 1: Simple response
    res.status(200).json({ 
      test: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.MONGODB_URI ? 'MongoDB URI found' : 'NO MongoDB URI'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
