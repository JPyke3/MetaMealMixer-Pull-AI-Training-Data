import fs from 'fs';
// Read in recipes.json and convert to object
const recipes = fs.readFileSync('recipes.json', 'utf8');
console.log(recipes);
