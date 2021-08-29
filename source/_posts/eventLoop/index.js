// var i = 0;
// function foo(){
//     i++;
//     if (i>20) return;
//     console.log("foo");
//     setTimeout(()=>console.log("setTimeout"), 0);       
//     process.nextTick(foo);
// }
// setTimeout(foo, 2000);
// setTimeout(()=>{console.log("Other setTimeout"); }, 2000);

// process.nextTick(() => {
//     console.log('process.nextTick');
// })

// setImmediate(() => {
//     console.log('setImmediate');
// })

// setTimeout(() => {
//     console.log('setTimeout');
// }, 1)


let carName;
function myCar() {
    process.nextTick(()=>{
        console.log("process.nextTick:this is mycar: " + carName);
    });
    setTimeout(() => {
        console.log("setTimeout:this is mycar: " + carName);
    });
    Promise.resolve().then(()=>{
        console.log("Promise.resolve().then:this is mycar: " + carName);
    });
    setTimeout(() => {
        console.log("setTimeout:this is mycar2: " + carName);
    });
    setImmediate(()=>{
        console.log("setImmediate:this is mycar: " + carName);
    });
}

// function setCarName() {
//     carName = "Audi"; 
// }
// setTimeout(() => {
//     setCarName();
// })
// myCar();


// const fs = require('fs')
// fs.readFile('./eventloop.md', () => {
//     console.log('fs.readFile');
//     setTimeout(() => {
//         console.log('setTimeout2');
//     });
// })
// // myCar()
// setTimeout(()=>{
//     console.log("setTimeout1");
// },1000);


for (let index = 0; index < 1000; index++) {
    // const element = array[index];
    setTimeout(() => {
        console.log("setTimeout" + index);
    }, 1000)
}

setImmediate(() => {
    console.log('setImmediate');
})
