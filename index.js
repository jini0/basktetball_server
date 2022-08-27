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

// <main페이지>
// 1. notice 공지사항 - main 3개만 뿌리기
app.get('/noticesmain', async (req, res)=>{
    connection.query(
        "select * from news_notice order by id desc limit 0,3",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})

// <PROMY>
// 1. sponser
app.get('/sponsers', async (req, res)=>{
    connection.query(
        "select * from promy_sponser",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})

// <NEWS>
// 1. notice 공지사항 전체
app.get('/notices', async (req, res)=>{
    connection.query(
        // 게시판이 id기준으로 내림차순하여 데이터 불러오도록! order by 컬럼명 desc / cf.오름차순 asc
        // ⚡날짜순(작성일 기준)으로 정렬하고 싶은데 -> 그게 안돼서 id를 기준으로 내림차순으로 함... <수정하기>⚡
        "select * from news_notice order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. notice 공지사항 상세보기
app.get('/notice/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from news_notice where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
        )
    }) 
// 1-2. 검색
app.get('/search/:check', async (req, res)=> {
    const params = req.params;
    const { check } = params;
    connection.query(
        `select * from news_notice where title like '%${check}%'`,
        (err, rows, fields)=> {
            console.log(rows);
            res.send(rows);
            // res.send(rows[0]);
        }
    )
})

// 2. news 뉴스

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

// 3. staff 전체
app.get('/staff', async (req, res)=>{
    connection.query(
        "select * from team_staff",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})

// 4. cheer 전체
app.get('/cheer', async (req, res)=>{
    connection.query(
        "select * from team_cheer",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})


// 서버실행
app.listen(port, () => {
    console.log('서버가 돌아가고 있습니다.');
})