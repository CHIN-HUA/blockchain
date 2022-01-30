//BLOCK CHAIN
const sha256 = require('crypto-js/sha256')

//一個區塊包含(data + 前一個區塊的hash值)
class Block{
    constructor(data, previousHash){
        this.data = data
        this.previousHash = previousHash
        this.hash = this.computeHash()
    }

    computeHash(){
        return sha256(this.data + this.previousHash).toString()
    }
}

//鏈
//祖先區塊
class Chain{

    constructor(){
        this.chain = [this.bigBang()]
    }

//祖先區塊前一個hash可能是空的
    bigBang(){
        const genesisBlock = new Block('我是祖先','')
        return genesisBlock
    }

    getLatestBlock()
    {
        return this.chain[this.chain.length-1]
    }
//添加區塊到區塊鏈上
    addBlockChain(newBlock){
        //data
        //找到最近一個block的hash
        //這個hash就是新區塊的previousHash
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.computeHash();
        this.chain.push(newBlock)
    }

    //驗證當前區塊是否合法
    //當前的data有沒有被竄改
    //我們要驗證區塊previousHash是否等於previous的hash
    validateChain(){
        if(this.chain.length === 1){
            if(this.chain[0].hash !== this.chain[0].computeHash()) {
                return false
            }
            return true
        }

     //我們從第二個區塊開始驗證   
     for(let i=1; i < this.chain.length-1; i++){
        const blockToValidate = this.chain[i]
                if(blockToValidate.hash !== blockToValidate.computeHash){
                    console.log('數據竄改')
                    return false
                }
                //我們要驗證區塊previousHash是否等於previous的hash
                const previousBlock = this.chain[i-1]
                if(blockToValidate.previousHash !== previousBlock.hash){
                    console.log('前後區塊鏈接斷裂')
                    return false
                }
        }
        return true
    }
}



const lutoChain = new Chain()
console.log(lutoChain.validateChain())

const block1 = new Block('轉10元','');
lutoChain.addBlockChain(block1);
const block2 = new Block('轉2個10元','');
lutoChain.addBlockChain(block2);


console.log(lutoChain.validateChain())

//嘗試竄改這個區塊鏈
lutoChain.chain[1].data = '轉100元'
console.log(lutoChain)
console.log(lutoChain.validateChain())