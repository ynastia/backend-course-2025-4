const { Command } = require('commander');
const fs = require('fs');
const http = require('http');
const { XMLBuilder } = require('fast-xml-parser');
const program = new Command();
program
  .version('1.0.0')
  .name('api-server')
  .description('Запуск веб-сервера з обов’язковими параметрами: шлях до файлу, хост та порт.')
  .requiredOption('-i, --input <path>', 'Шлях до вхідного JSON файлу')
  .requiredOption('-h, --host <address>', 'Адреса сервера (наприклад, 127.0.0.1)')
  .requiredOption('-p, --port <number>', 'Порт сервера (наприклад, 3000)', val => parseInt(val, 10));
program.parse(process.argv);
const options = program.opts();

const INPUT_FILE = options.input;
const HOST = options.host;
const PORT = options.port;
if (!fs.existsSync(INPUT_FILE)) {
  console.error('Cannot find input file');
  process.exit(1);
}
const server = http.createServer(async (req, res) => {
  try {
    const data = await fs.promises.readFile(INPUT_FILE, 'utf-8');
    let records = JSON.parse(data);
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    const humidity = url.searchParams.get('humidity') === 'true';
    const minRainfall = parseFloat(url.searchParams.get('min_rainfall'));

    if (!isNaN(minRainfall)) {
      records = records.filter(r => parseFloat(r.Rainfall) > minRainfall);
    }

    const result = {
      weather_data: {
        record: records.map(r => {
          const item = {
            rainfall: r.Rainfall,
            pressure3pm: r.Pressure3pm,
          };
          if (humidity) item.humidity = r.Humidity3pm;
          return item;
        })
      }
    };

    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    const xml = builder.build(result);

    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    res.end(xml);

  } catch (err) {
    console.error('Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
})
server.listen(PORT, HOST, () => {
  console.log(` Сервер запущено на http://${HOST}:${PORT}`);
  console.log(`Використовується файл: ${INPUT_FILE}`);
});
