class Promise {
    constructor(excutor) {
        let self = this
        self.status = 'pending'
        self.value = ''
        self.reason = ''
        self.onFulfilledCallbacks = []
        self.onRejectedCallbacks = []

        function resolve(value) {
            if (self.status == 'pending') {
                self.status = 'resolved'
                self.value = value
                self.onFulfilledCallbacks.forEach(fn => {
                    fn()
                })
            }
        }

        function reject(reason) {
            if (self.status == 'pending') {
                self.status = 'rejected'
                self.reason = reason
                self.onRejectedCallbacks.forEach(fn => {
                    fn()
                })
            }
        }
        try {
            excutor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function(data) {
            return data
        }
        onRejected = typeof onRejected === 'function' ? onRejected : function(err) {
            throw err
        }
        let self = this
        let promise2 = new Promise((resolve, reject) => {
            if (self.status === 'resolved') {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(self.value);
                        resolvePromise(x, promise2, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }
            if (self.status === 'rejected') {
                setTimeout(() => {
                    try {
                        let x = onRejected(self.reason)
                        resolvePromise(x, promise2, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }
            if (self.status === 'pending') {
                self.onFulfilledCallbacks.push(function() {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(self.value)
                            resolvePromise(x, promise2, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
                self.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(self.reason)
                            resolvePromise(x, promise2, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
            }
        })
        return promise2
    }
    resolve(value) {
        return new Promise((resolve, reject) => {
            resolve(value);
        })
    }
    reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        })
    }
    catch (errFn) {
        return this.then(null, errFn)
    }
}
//解析返回值
let called;

function resolvePromise(x, promise2, resolve, reject) {
    //如果返回值和then返回一样
    if (x == promise2) {
        return reject(new TypeError('循环引用'))
    }
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            let then = x.then; //根据是否有then方法来判断返回值是否是promise
            if (typeof then === 'function') {
                x.then(y => {
                    if (called) {
                        return
                    }
                    called = true
                        // 一直执行下去 直到返回的值是一个普通值
                    resolvePromise(y, promise2, resolve, reject)
                }, reason => {
                    reject(reason)
                })
            } else {
                if (called) {
                    return
                }
                called = true
                resolve(x)
            }
        } catch (e) {
            if (called) {
                return
            }
            called = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}
// export Promise;
module.exports = Promise