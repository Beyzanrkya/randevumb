const fs = require('fs');
const file = './frontend/src/pages/BusinessAppointments.jsx';

let content = fs.readFileSync(file, 'utf8');

// Update theme colors
content = content.replace(/primary:\s*"#ec4899"/g, 'primary: "#8E4A5D"');
content = content.replace(/primaryHover:\s*"#be185d"/g, 'primaryHover: "#6B3545"');
content = content.replace(/secondary:\s*"#fbcfe8"/g, 'secondary: "#C28798"');
content = content.replace(/bg:\s*"linear-gradient\(135deg,\s*#fdf2f8\s*0%,\s*#fce7f3\s*100%\)"/g, 'bg: "linear-gradient(135deg, #FAF7F8 0%, #F3EBED 100%)"');

// Replace inline colors (svg, box-shadows, etc.)
content = content.replace(/rgba\(236,\s*72,\s*153/g, 'rgba(142, 74, 93');
content = content.replace(/#ec4899/g, '#8E4A5D');
content = content.replace(/#fbcfe8/g, '#C28798');

fs.writeFileSync(file, content, 'utf8');
console.log('Updated colors in BusinessAppointments.jsx');
