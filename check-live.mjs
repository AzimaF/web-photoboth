import fs from 'fs';
import https from 'https';

https.get('https://azimaf.github.io/web-photoboth/assets/index-Bddn45QW.js', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Search for the greenHills check in minified code
    // The original code has: g > r - 5 && g > b + 10
    const match = data.match(/[^}]*?>[a-zA-Z0-9_]+\s*-\s*5[^}]*?>[a-zA-Z0-9_]+\s*\+\s*10[^}]*}/g);
    if (match) {
      console.log('Found green hills logic:', match[0]);
    } else {
      console.log('Green hills logic not found by regex');
    }
    
    // Check for fileName === 'book.png'
    const match2 = data.match(/fileName==="book\.png"/g);
    if (match2) {
      console.log('Found fileName === "book.png" exception!');
      // Find the context
      const idx = data.indexOf('fileName==="book.png"');
      console.log('Context:', data.substring(idx - 50, idx + 100));
    } else {
      console.log('No fileName exception found.');
    }
  });
});
