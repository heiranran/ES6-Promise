let path = require('path')
let fs = require('fs')
let vm = require('vm')

function Module(id) {
    this.id = id;
    this.exports = {}
}
//处理文件扩展名
Module.extensions = {
    '.js' (module) {
        let content = fs.readFileSync(module.id, 'utf-8')
            //用函数把文件内容包起来
        let moduleWrap = ['(function(exports,module,require,__filename,__dirname){', '})']
        let script = moduleWrap[0] + content + moduleWrap[1]
        vm.runInThisContext(script).call(module.exports, module.exports, module, require2)
    },
    '.json' (module) {
        console.log(module)
        module.exports = JSON.parse(fs.readFileSync(module.id, 'utf-8'))
    }
}
//解析文件路径
Module.resolveFilename = function(filename) {
    //把文件路径转为绝对路径
    let filepath = path.resolve(__dirname, filename)
    if (!path.extname(filepath)) { //判断文件是否有扩展名 没有就添加扩展名
        let extname = Object.keys(Module.extensions)
        for (let i = 0; i < extname.length; i++) {
            let p = filepath + extname[i]
            try { //判断拼接好扩展名的文件路径是否能访问
                fs.accessSync(p)
                return p
            } catch (e) {
                // console.log(e)
            }
        }
    }
}

//加载模块 
Module.load = function(filename) {
    let absPath = Module.resolveFilename(filename)
    console.log(absPath)
    let module = new Module(absPath)
    let ext = path.extname(module.id)
    console.log(ext)
    Module.extensions[ext](module)
    return module.exports
}

function require2(id) {
    return Module.load(id)
}
let user = require('./user')
console.log(user);