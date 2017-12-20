const program = require('commander');
const colors = require('colors');
const path = require('path');
const LineByLineReader = require('line-by-line');
const fsextra = require('fs-extra');
const norfs = require('nor-fs');

const startTime = new Date();
let endTime = '';

program
  .version('1.00')
  .description(
    'A simple tool to chunk large markdown coderplex learning guide to small files based on custom identifier',
  )
  .option('-d, --dir <required>', 'path to guide')
  .option('-b, --verbose', 'show generated folder structure')
  .parse(process.argv);

colors.setTheme({
  input: 'grey',
  info: ['green', 'bold'],
  unitColor: 'cyan',
  chapterColor: 'magenta',
  content: 'blue',
  error: 'red',
  infoBack: ['white', 'bold', 'bgGreen'],
});

process.stdout.write('\x1Bc');

if (program.dir === undefined) {
  console.log('>> Enter correct path of learn guide to split'.error);
  throw new Error('directory name not defined');
}
if (path.extname(path.basename(program.dir)) !== '.md') {
  console.log('>> Please specify only markdown files'.error);
  throw new Error('invalid filetype');
}
const guideLocation = program.dir;
const guideName = path.basename(guideLocation, '.md');
const isVerboseMode = program.verbose;
console.log('>> Cleave Markdown running on'.info, guideLocation.input);

lineReader = new LineByLineReader(guideLocation);

lineReader.on('error', err => {
  console.log(err.error);
});

let currentUnit = '',
  currentChapter = '',
  currentFolderDir = '',
  currentFileDir = '';
if (isVerboseMode) {
  console.log('>> Folder structure is below\n'.info);
}
lineReader.on('line', line => {
  if (line.split(' ')[0] === '#') {
    const unitName = line
      .slice(2)
      .replace(/ /g, '-')
      .toLowerCase();
    if (isVerboseMode) {
      console.log(unitName.unitColor);
    }

    currentUnit = unitName;
    currentChapter = '';
    currentFolderDir = './' + guideName + '/' + currentUnit;
    currentFileDir = '';
  } else if (line.split(' ')[0] === '##') {
    const chapterName = line
      .slice(3)
      .replace(/ /g, '-')
      .toLowerCase();
    if (isVerboseMode) {
      console.log('  ', chapterName.chapterColor);
    }
    currentChapter = chapterName;
    currentFileDir = currentFolderDir + '/' + chapterName + '.md';

    fsextra.ensureFileSync(currentFileDir);
    norfs.sync.chmod(currentFileDir, '744');
  } else if (currentFolderDir !== '' && currentFileDir !== '') {
    if (line.split(' ')[0] === '###') {
      const topicName = line
        .slice(4)
        .replace(/ /g, '-')
        .toLowerCase();
      if (isVerboseMode) {
        console.log('    ', topicName.content);
      }
    }
    norfs.sync.appendFile(currentFileDir, line + '\n', { encoding: 'utf8' });
  }
});

lineReader.on('end', () => {
  endTime = new Date();
  const completedTime = `${Math.abs(
    endTime.getTime() - startTime.getTime(),
  )}ms`;
  console.log(
    '\nSplitting of'.info,
    guideName.input,
    'done in'.info,
    completedTime.infoBack,
  );
});
