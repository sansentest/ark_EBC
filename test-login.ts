import { triggerEBCLogin } from './src/app/actions/automationActions';

async function test() {
  console.log('Testing login...');
  // Note: assuming student id 1 exists in the DB.
  // We will pass the local host as serverHost just in case.
  const result = await triggerEBCLogin(1, 'http://localhost:3000');
  console.log('Result:', result);
}

test().catch(console.error);
