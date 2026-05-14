const bcrypt = require('bcryptjs');
console.log('bcrypt type:', typeof bcrypt);
console.log('bcrypt properties:', Object.keys(bcrypt));
if (bcrypt.default) {
  console.log('bcrypt.default properties:', Object.keys(bcrypt.default));
}
