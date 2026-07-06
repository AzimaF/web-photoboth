import fs from 'fs';
import https from 'https';

https.get('https://azimaf.github.io/web-photoboth/assets/index-Bddn45QW.js', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('live.js', data);
    console.log('Saved live.js');
    
    // Check all occurrences of "book.png"
    let idx = data.indexOf('book.png');
    while (idx !== -1) {
      console.log('Found book.png at', idx);
      console.log('Context:', data.substring(Math.max(0, idx - 60), idx + 60));
      idx = data.indexOf('book.png', idx + 1);
    }
  });
});
