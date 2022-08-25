//1. npm init   //npm 초기화
//2. npm install express
//3. npm install cors
const express = require("express");    //express로 만들거니까!
const cors = require("cors");
const app = express();
const port =  process.env.PORT || 8001;
const fs = require('fs');
const dataj = fs.readFileSync("./database.json");
const parseData = JSON.parse(dataj);
const mysql = require('mysql');

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

// <TEAM>
// 1. player 선수 전체
app.get('/players', async (req, res)=>{
    connection.query(
        "select * from team_player",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. position에 따라서,
//-GUARD
//-FORWARD
//-CENTER
//-ARMY
// app.get('/player/:position1', async (req, res)=>{
//     const params = req.params;
//     connection.query(
//         `select * from team_player where position1=${params.position1}`,
//         (err, rows, fields)=>{
//             res.send(rows);
//             console.log(err);
//         }
//     )
// })

// 2. player 한명씩 - detail
app.get('/player/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from team_player where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 


// 서버실행
app.listen(port, () => {
    console.log('서버가 돌아가고 있습니다.');
})