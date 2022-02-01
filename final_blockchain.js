//BLOCK CHAIN
//這個版本設置轉帳功能
//發幣功能
//新增加密簽名功能
//簡易完整版

//加解密lib
const ecLib = require("elliptic").ec;
const ec = new ecLib("secp256k1"); // curve name
const sha256 = require("crypto-js/sha256");
// 生成我们的密钥对 generate the keypair
const key = ec.genKeyPair();

// 拿到我们的私钥和公钥 希望拿到hex string格式的
console.log("private", key.getPrivate("hex"));
console.log("public", key.getPublic("hex"));

//轉帳功能
class Transaction{
    constructor(from, to, amount){
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

    computeHash(){
        return sha256(
            this.from +
            this.to +
            this.amount 
        ).toString();
    }

     // 签名需要private key
    sign(Key){
        this.signature = Key.sign(this.computeHash(), 'base64').toDER('hex')
    }

    isValid(){
        if(this.from === ""){
            return true
        }
        const KeyObj = ec.keyFromPublic(this.from, 'hex')
        return KeyObj.verify(this.computeHash() , this.signature)
    }
}
if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }
//一個區塊包含(data + 前一個區塊的hash值)
class Block{
    constructor(transaction, previousHash){
        //data是string
        //data transaction要轉變成 array of objects
        this.transaction = transaction
        this.previousHash = previousHash
        this.timestamp = Date.now()
        this.nonce = 1 //隨機數
        this.hash = this.computeHash()
    }

    computeHash(){
        //data 需要 stringify
        //JSON stringify
        return sha256(
         JSON.stringify(this.transaction) 
         + this.previousHash 
         + this.nonce 
         + this.timestamp
        ).toString();
    }

    getAnswer(difficulty){
    //開頭為前n位的hash
        let answer = ''
        for(let i = 0; i < difficulty; i++){
            answer += '0'
        }
        return answer
    }

    //計算符合區塊鏈難度的要求hash
    //挖礦
    mine(difficulty){
        //挖的時候就要驗證合法性，不然就浪費算力
        this.validateBlockTransactions()
        while(true){
            this.hash = this.computeHash()
            if(this.hash.substring(0,difficulty) !== this.getAnswer(difficulty)){
                this.nonce++ //找值的過程
                this.hash = this.computeHash()
            }
            else{
                break
            }
        }
        console.log('挖礦結束', this.hash)
    }
    validateBlockTransactions(){
        for(let transaction of this.transaction){
            if(!transaction.isValid())
                console.log('invalida transaction found in transactions 異常交易')
                return false
        }
        return true
    }
}

//鏈
//祖先區塊
class Chain{
    constructor(){
        this.chain = [this.bigBang()];
        this.transactionPool = []
        this.minerReward = 50; //50個幣獎勵
        this.difficulty = 1; //挖懭難度
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

    //添加transaction 到 transactionPool
    addTransaction(transaction) {
        console.log(transaction)
        if(!transaction.from || !transaction.to)
          console.log('invalid from or to')
        if(!transaction.isValid())
        console.log('invalid transaction, tampered or invalid sig')
    
        this.transactionPool.push(transaction);
    }

    //添加區塊到區塊鏈上
    addBlockChain(newBlock){
        //data
        //找到最近一個block的hash
        //這個hash就是新區塊的previousHash
        newBlock.previousHash = this.getLatestBlock().hash;
        // newBlock.hash = newBlock.computeHash();
        newBlock.mine(this.difficulty) //設置挖礦的難度
        //滿足這個hash需要滿足的條件
        this.chain.push(newBlock)
    }
    mineTransactionPool(minerRewardAddress){
        //1.發放礦工獎勵
        const minerRewardTransaction = new Transaction(
            '',minerRewardAddress,this.minerReward
        );
        this.transactionPool.push(minerRewardTransaction)
        //2.挖礦
        const newBlock = new Block(
            this.transactionPool, this.getLatestBlock().hash
        );
        newBlock.mine(this.difficulty);//挖
        //3.添加區塊鏈到區塊
        //清空trasaction Pool
        this.chain.push(newBlock)
        this.transactionPool = []
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
        if(!blockToValidate.validateBlockTransactions()){
            console.log('發現非法交易')
            return false
        }

                //判斷數據有沒有被竄改
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



const lutoCoin = new Chain()

const keyPairSender = ec.genKeyPair();
const publicKeySender = keyPairSender.getPublic('hex')

const keyPairReceiver = ec.genKeyPair()
const publicKeyReceiver = keyPairReceiver.getPublic('hex')

const t1 = new Transaction(publicKeySender, publicKeyReceiver, 'addr2', 10)
t1.sign(keyPairSender)
console.log(t1)
console.log(t1.isValid())

lutoCoin.addTransaction(t1)
lutoCoin.mineTransactionPool(publicKeyReceiver)
console.log(lutoCoin)
console.log(lutoCoin.chain[1])
console.log(lutoCoin.chain[1].transaction)

//----------------------------------
// console.log(lutoCoin)

//挖礦動作
// lutoCoin.mineTransactionPool('addr3')


// const block1 = new Block('轉10元','');
// lutoChain.addBlockChain(block1);
// const block2 = new Block('轉2個10元','');
// lutoChain.addBlockChain(block2);


// console.log(lutoChain.validateChain())

// //嘗試竄改這個區塊鏈
// lutoChain.chain[1].data = '轉100元'
// console.log(lutoChain)
// console.log(lutoChain.validateChain())


