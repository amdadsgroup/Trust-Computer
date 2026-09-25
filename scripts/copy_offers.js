const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'app', 'admin', '(dashboard)', 'offers', 'OffersManagementClient.tsx');
const dest = path.join(__dirname, '..', 'components', 'admin', 'OffersManagementClient.tsx');

let content = fs.readFileSync(src, 'utf-8');
content = content.replace("from './actions';", "from '@/app/admin/(dashboard)/offers/actions';");

fs.writeFileSync(dest, content, 'utf-8');
console.log('OffersManagementClient copied successfully to components/admin/OffersManagementClient.tsx');
