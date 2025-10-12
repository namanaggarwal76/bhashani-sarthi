/**
 * Helper utility to check if Firebase is properly configured
 */

export function checkFirebaseConfig(): {
  isConfigured: boolean;
  missingVars: string[];
  message: string;
} {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName] || import.meta.env[varName] === 'your-api-key-here' || import.meta.env[varName].includes('your-')
  );

  const isConfigured = missingVars.length === 0;
  
  const message = isConfigured
    ? 'Firebase is properly configured ✓'
    : `Firebase configuration incomplete. Missing or invalid: ${missingVars.join(', ')}`;

  return {
    isConfigured,
    missingVars,
    message,
  };
}

export function logFirebaseStatus(): void {
  const status = checkFirebaseConfig();
  
  if (status.isConfigured) {
    console.log('✓ Firebase configuration is valid');
  } else {
    console.error('✗ Firebase configuration error:', status.message);
    console.error('Please update your .env.local file with valid Firebase credentials');
    console.error('See README.md for setup instructions');
  }
}
