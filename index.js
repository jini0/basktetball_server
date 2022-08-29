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
const { resolveSoa } = require("dns");

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
// 1-2. notice 조회수 - main
app.put('/viewNoticeMain/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update news_notice set view= view + 1 where id = ${params.id} `,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})
// 2. news 뉴스 - main 3개만 뿌리기
app.get('/newsmain', async (req, res)=>{
    connection.query(
        "select * from news_news order by id desc limit 0,3",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 2-1. news 조회수 - main
app.put('/viewNewsMain/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update news_news set view= view + 1 where id = ${params.id} `,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})
// 3. photo 포토 - main 뿌리기
app.get('/photomain', async (req, res)=>{
    connection.query(
        "select * from fan_photo order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 3-1. photo 조회수
app.put('/viewPhotoMain/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update fan_photo set view= view + 1 where id = ${params.id} `,
        // `update news_notice set view= view + 1`,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})
// 4. Youtube 유튜브 - main 뿌리기
app.get('/youtubemain', async (req, res)=>{
    connection.query(
        "select * from fan_youtube order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 4-1. Youtube 유튜브 조회수
app.put('/viewYoutubeMain/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update fan_youtube set view= view + 1 where id = ${params.id} `,
        // `update news_notice set view= view + 1`,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
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
// app.get('/search/:check', async (req, res)=> {
//     const params = req.params;
//     const { check } = params;
//     connection.query(
//         `select * from news_notice where title like '%${check}%'`,
//         (err, rows, fields)=> {
//             console.log(rows);
//             res.send(rows);
//             // res.send(rows[0]);
//         }
//     )
// })
// 1-3. notice 조회수
app.put('/view/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update news_notice set view= view + 1 where id = ${params.id} `,
        // `update news_notice set view= view + 1`,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})
// 1-4. notice 등록
app.post('/registerNotice', async (req, res) => {
    const { c_title, c_date, c_address1, c_address2, c_img1, c_img2, c_img3, c_img4, c_img5, c_desc, c_view } = req.body;
    // console.log(req.body);
    connection.query("INSERT INTO news_notice(`title`,`date`,`address`,`address2`,`imgsrc`,`imgsrc2`,`imgsrc3`,`imgsrc4`,`imgsrc5`,`noticedesc`,`view`) values(?,?,?,?,?,?,?,?,?,?,?)",
    [c_title, c_date, c_address1, c_address2, c_img1, c_img2, c_img3, c_img4, c_img5, c_desc, c_view],
    (err, result, fields)=>{
        if(result){
            console.log(result);
            res.send("게시글 등록이 완료되었습니다.");
        }
       
    })
})
// 1-6. notice 삭제
app.delete('/delNotice/:id', async (req, res)=>{
    const params = req.params;
    console.log("게시글 삭제");
    connection.query(`delete from news_notice where id = ${params.id}`,
    (err, rows, fields) => {
        res.send(rows);
        console.log(err);
    })    
})

// 2. news 뉴스 전체
app.get('/newses', async (req, res)=>{
    connection.query(
        // ⚡날짜순(작성일 기준)으로 정렬하고 싶은데 -> 그게 안돼서 id를 기준으로 내림차순으로 함... <수정하기>⚡
        "select * from news_news order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 2-2. news 조회수
app.put('/viewNews/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update news_news set view= view + 1 where id = ${params.id} `,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})
// 2-3. news 삭제
app.delete('/delNews/:id', async (req, res)=>{
    const params = req.params;
    console.log("게시글 삭제");
    connection.query(`delete from news_news where id = ${params.id}`,
    (err, rows, fields) => {
        res.send(rows);
        console.log(err);
    })    
})

// <TEAM>
// 1. player 선수 전체
app.get('/players', async (req, res)=>{
    connection.query(
        "select * from team_player order by name asc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. player 한명씩 - detail
app.get('/player/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from team_player where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 

// 2. staff 전체
app.get('/staff', async (req, res)=>{
    connection.query(
        "select * from team_staff",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})

// 3. cheer 전체
app.get('/cheer', async (req, res)=>{
    connection.query(
        "select * from team_cheer",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})

// <Fan>
// 2. Youtube 유튜브 전체(아이디로..!)
app.get('/youtubes', async (req, res)=>{
    connection.query(
        "select * from fan_youtube order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 2-1. Youtube 유튜브 클릭전 - 제일 최근 영상 재생
app.get('/youtubeLatest', async (req, res)=>{
    connection.query(
        "select * from fan_youtube order by id desc limit 0,1",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 2-2. Youtube 유튜브 클릭시 - 상세
app.get('/youtube/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from fan_youtube where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 
// 2-3. Youtube 조회수
app.put('/viewYoutube/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update fan_youtube set view= view + 1 where id = ${params.id} `,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})


// 1. Photo 사진 전체
app.get('/photos', async (req, res)=>{
    connection.query(
        "select * from fan_photo order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. photo 상세보기 - detail
app.get('/photo/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from fan_photo where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 
// 1-1. photo 조회수
app.put('/viewPhoto/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update fan_photo set view= view + 1 where id = ${params.id} `,
        // `update news_notice set view= view + 1`,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})

// <Event>
// 1. event 전체
app.get('/events', async (req, res)=>{
    connection.query(
        "select * from event order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. 진행중인 이벤트가 없을시
app.get('/ongoing', async (req, res)=>{
    connection.query(
        `select * from event where sort="ongoing"`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 
// 1-2. event 상세보기 - detail
app.get('/event/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from event where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 
// 1-3. event 조회수
app.put('/viewEvent/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `update event set view= view + 1 where id = ${params.id} `,
        // `update news_notice set view= view + 1`,
        (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                // console.log(rows);
            }
        }
    )
})

// 서버실행
app.listen(port, () => {
    console.log('서버가 돌아가고 있습니다.');
})