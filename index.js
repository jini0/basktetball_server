//1. npm init   //npm 초기화
//2. npm install express
//3. npm install cors
const express = require("express");         //express로 만들거니까!
const cors = require("cors");
const app = express();
const port =  process.env.PORT || 8001;

//데이터베이스 연결
const connection = mysql.createConnection({
    host: parseData.host,
    user:parseData.user,
    password:parseData.password,
    port:parseData.port,
    database: parseData.database
})

// 서버실행
app.listen(port, () => {
    console.log('서버가 돌아가고 있습니다.');
})