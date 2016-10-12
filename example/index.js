console.log('Hello from root', process.send ? 'Child' : 'Parent', process.argv)

setTimeout(() => {
  require('child_process').fork('./test.js', ['a','b','c','d'])
},5000)

