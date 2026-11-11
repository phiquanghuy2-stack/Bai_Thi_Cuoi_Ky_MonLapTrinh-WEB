const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Đang khởi động đồng thời Backend (Cổng 5000) và Frontend (Cổng 5173) cho HVA HOMESTAY...\n');

const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
});

const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
