const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const exec = require('child_process').exec
const crypto = require('crypto')
const chalk = require('chalk')
const log = console.log
const ora = require('ora')

let Task = function() {
  this.spinner = null
  this.watcher = chokidar.watch('./src')
  this.watchStack = []
}

Task.prototype = {
  watch: function() {
    this.watcher
      .on('change', _path => {
        let fileHash = this.createFileHash256Sync(_path)
        let srcList = this.watchStack.map(item => item.src)
        let index = srcList.findIndex(src => src === _path)
        if (index === -1) {
          this.watchStack.push({
            src: _path,
            hash: fileHash,
            need: true,
            hasError: false
          })
        } else if (this.watchStack[index].hasError || this.watchStack[index].hash !== fileHash) {
          this.watchStack[index].hash = fileHash
          this.watchStack[index].need = true
        } else {
          this.watchStack[index].need = false
        }
        let watchList = this.watchStack.filter(item => item.need)
        if (watchList.length > 0) {
          this.spinner = ora(chalk.green.bold('Eslint begins\n')).start()
          this.runEslint()
        }
      })
      .on('error', error => {
        log('Error happened', error)
      })
      .on('ready', () => {
        log(chalk.green(`终于等到你🎉 🎉 🎉\n`))
      })
  },
  createFileHash256Sync: function(src) {
    const buffer = fs.readFileSync(path.join(__dirname, src))
    let fsHash = crypto.createHash('sha256')
    fsHash.update(buffer)
    const md5 = fsHash.digest('hex')
    return md5
  },
  runEslint: function() {
    let watchList = this.watchStack.filter(item => item.need)
    if (watchList.length === 0) return
    let file = watchList.map(item => path.join(__dirname, item.src)).join(' ')
    let process = exec(`npx eslint -f codeframe ${file}`)
    // 打印正常的后台可执行程序输出
    process.stdout.on('data', data => {
      this.spinner.fail(chalk.red.bold('Error occurred\n'))
      log(chalk.red(`\n${data}\n`))
      this.watchStack.forEach(item => {
        if (data.includes(item.src)) {
          item.hasError = true
        } else {
          item.hasError = false
        }
      })
    })
    // 打印错误的后台可执行程序输出
    process.stderr.on('data', function (data) {
      log(chalk.red('error:' + data))
    })
    // 退出之后的输出
    process.on('close', code => {
      if (code === 0) {
        this.watchStack.forEach(item => {
          item.need = false
          item.hasError = false
        })
        this.spinner.succeed(chalk.green.bold(`eslint successfully\n`))
      } else if (code === 1) {
        log(chalk.white.blackBright.bold(`--------------------------------------------- 🙅 🙅 🙅 ---------------------------------------------\n`))
      }
    })
  }
}

let task = new Task()
task.watch()