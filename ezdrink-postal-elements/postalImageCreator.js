// Save this file as generate-indicia.js
// Requires Node.js to be installed on your computer

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Define brand colors
const brandGold = '#d4af37';
const darkBg = '#121212';

// Function to generate the Local Postal Customer image - Gold on Dark
function generateLocalGold() {
  const canvas = createCanvas(300, 60);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = darkBg;
  ctx.fillRect(0, 0, 300, 60);
  
  // Text
  ctx.fillStyle = brandGold;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LOCAL POSTAL CUSTOMER', 150, 30);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'local-postal-customer-gold.png'), buffer);
  
  console.log('Created: local-postal-customer-gold.png');
}

// Function to generate the Local Postal Customer image - Black on White
function generateLocalWhite() {
  const canvas = createCanvas(300, 60);
  const ctx = canvas.getContext('2d');
  
  // Background with border
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 300, 60);
  ctx.strokeStyle = darkBg;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 298, 58);
  
  // Text
  ctx.fillStyle = darkBg;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LOCAL POSTAL CUSTOMER', 150, 30);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'local-postal-customer-white.png'), buffer);
  
  console.log('Created: local-postal-customer-white.png');
}

// Function to generate the PRSRT STD Indicia - Gold on Dark
function generatePrsrtGold() {
  const canvas = createCanvas(300, 140);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = darkBg;
  ctx.fillRect(0, 0, 300, 140);
  
  // Text
  ctx.fillStyle = brandGold;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const lines = [
    'PRSRT STD',
    'ECRWSS',
    'U.S. POSTAGE',
    'PAID',
    'EDDM RETAIL'
  ];
  
  // Calculate vertical spacing
  const lineHeight = 22;
  const totalHeight = lines.length * lineHeight;
  const startY = (140 - totalHeight) / 2 + lineHeight / 2;
  
  // Draw each line of text
  lines.forEach((line, index) => {
    ctx.fillText(line, 150, startY + index * lineHeight);
  });
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'prsrt-std-gold.png'), buffer);
  
  console.log('Created: prsrt-std-gold.png');
}

// Function to generate the PRSRT STD Indicia - Black on White
function generatePrsrtWhite() {
  const canvas = createCanvas(300, 140);
  const ctx = canvas.getContext('2d');
  
  // Background with border
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 300, 140);
  ctx.strokeStyle = darkBg;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 298, 138);
  
  // Text
  ctx.fillStyle = darkBg;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const lines = [
    'PRSRT STD',
    'ECRWSS',
    'U.S. POSTAGE',
    'PAID',
    'EDDM RETAIL'
  ];
  
  // Calculate vertical spacing
  const lineHeight = 22;
  const totalHeight = lines.length * lineHeight;
  const startY = (140 - totalHeight) / 2 + lineHeight / 2;
  
  // Draw each line of text
  lines.forEach((line, index) => {
    ctx.fillText(line, 150, startY + index * lineHeight);
  });
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'prsrt-std-white.png'), buffer);
  
  console.log('Created: prsrt-std-white.png');
}

// Generate all images
console.log('Generating EzDrink postal indicia images...');
generateLocalGold();
generateLocalWhite();
generatePrsrtGold();
generatePrsrtWhite();
console.log('All images generated successfully in the "output" folder.');