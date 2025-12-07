// Quick test script to check which Gemini models are available
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// List of models to test
const modelsToTest = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro',
  'gemini-1.5-pro-latest'
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say "Hello" if you can read this.');
    const response = await result.response;
    const text = response.text();
    return { success: true, response: text.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testAllModels() {
  console.log('🔍 Testing available Gemini models...\n');
  console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  for (const modelName of modelsToTest) {
    console.log(`Testing: ${modelName}...`);
    const result = await testModel(modelName);
    
    if (result.success) {
      console.log(`✅ ${modelName} - WORKING`);
      console.log(`   Response: ${result.response}\n`);
    } else {
      console.log(`❌ ${modelName} - FAILED`);
      console.log(`   Error: ${result.error}\n`);
    }
  }

  console.log('\n💡 The backend will automatically use the first working model.');
}

testAllModels().catch(console.error);

