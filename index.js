//1. npm init   //npm 초기화
//2. npm install express
//3. npm install cors
const express = require("express");     //express로 만들거니까!
const cors = require("cors");
const app = express();
const port =  process.env.PORT || 8001;

app.use(express.json());     //json형식의 데이터를 처리할수 있도록설정
app.use(cors());    //브라우저의 다양한 사용을 위해 설정

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