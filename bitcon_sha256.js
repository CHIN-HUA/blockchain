const sha256 = require('crypto-js/sha256')

console.log(sha256('luotuo1').toString())
console.log(sha256('luotuo2').toString())

//對於不同的輸入, 輸出結果不同
//對於同一個輸入，輸出結果是一樣的

//需要找到一個開頭為0的hash值, 請告訴我X是多少
//需要找到4個開頭為0的hash值, 請告訴我X是多少

function proofOfWork(){
    let data = 'luotuo'
    let x = 1
    while(true){
        if(sha256(data + x).toString().substring(0,4) !== '0000'){
            x++;
        }
        else{
            console.log(sha256(data + x).toString())
            console.log(x)
            break
        }
    }
}

proofOfWork();