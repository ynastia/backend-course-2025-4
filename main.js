const { Command } = require('commander');
const fs = require('fs');
const http = require('http');
const program = new Command(); 
program
    .version('1.0.0')
    .name('api-server')
    .description('Запуск веб-сервера з обов’язковими параметрами: шлях до файлу, хост та порт.');
program
    .requiredOption('-i, --input <path>', 'Шлях до вхідного JSON файлу')
    .requiredOption('-h, --host <address>', 'Адреса сервера (наприклад, 127.0.0.1)')
    .requiredOption('-p, --port <number>', 'Порт сервера (наприклад, 3000)', (val) => parseInt(val, 10)); 

program.parse(process.argv);
const options = program.opts();
const INPUT_FILE = options.input;
const HOST = options.host;
const PORT = options.port;
try {
    if (!fs.existsSync(INPUT_FILE)) {
        throw new Error('Cannot find input file');
    }
} catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
}
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running. Waiting for Part 2 implementation...');
});

server.listen(PORT, HOST, () => {
    console.log(`\n✅ Server is running and listening at http://${HOST}:${PORT}/`);
    console.log(`Input file path verified: ${INPUT_FILE}`);
});