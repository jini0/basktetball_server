//1. npm init   //npm 초기화
//2. npm install express
//3. npm install cors
const express = require("express");    //express로 만들거니까!
const cors = require("cors");
const app = express();
const port =  process.env.PORT || 8001;
const fs = require('fs');   //파일을 읽어오도록 해준다.
const dataj = fs.readFileSync("./database.json");
const parseData = JSON.parse(dataj);    //json데이터를 객체 형태로 변경
const mysql = require('mysql');
// const { resolveSoa } = require("dns");
const bcrypt = require('bcrypt');   //비밀번호 암호화       //6. npm install bcrypt
const saltRounds = 10;              //10번 암호화 할거다!(기회)

//use는 앱에 대한 설정
app.use(express.json());     //json형식의 데이터를 처리할수 있도록 설정(json형식으로 정보를 전달하겠다.)
app.use(cors());    //브라우저의 다양한 사용을 위해 설정 /모든 브라우저에서 요청을 할 수 있게 해줌 / 브라우저의 CORS이슈를 막기 위해 사용하는 코드

//데이터베이스 연결
const connection = mysql.createConnection({
    host: parseData.host,
    user:parseData.user,
    password:parseData.password,
    port:parseData.port,
    database: parseData.database
})

// 회원가입 요청
app.post("/join", async (req, res)=>{
    let myPlanintextPass = req.body.userPass;      
    let myPass = "";     
    if(myPlanintextPass != '' && myPlanintextPass != undefined){     //빈 값과 undefined가 아닐때,
        //1. 💗https://www.npmjs.com/package/bcrypt 에서 긁어오고 변수만 제대로 고쳐주기!!!!(Technique 1 (generate a salt and hash on separate function calls): 꺼 긁어와서)💗
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlanintextPass, salt, function(err, hash) {
                // Store hash in your password DB.
                myPass = hash;
                console.log(myPass);
                //2. 쿼리 작성
                // phone 번호를 int로 하면 010을 입력했을때, 숫자라서 0이 사라지고 10만 자꾸 남음! phone2/phone3도 마찬가지!! ---> varchar로 해주자!!✨
                const {userId, userName, userBirthY, userBirthM, userBirthD, userGender, userPhone, userPhone2, userPhone3, userMail, userAdd, userAdd_detail} = req.body;              //regdate등록일만 바로 넣어줄거임  --> now()함수 사용하고 DATE_FORMAT을 이용해서 년/월/일만 나오게(시간은 빼고!):'%Y-%m-%d'                    
                connection.query("insert into member(userid, password, name, birthY, birthM, birthD, gender, phone, phone2, phone3, mail, add1, add2, regdate) values(?,?,?,?,?,?,?,?,?,?,?,?,?,DATE_FORMAT(now(),'%Y-%m-%d'))",
                [userId, myPass, userName, userBirthY, userBirthM, userBirthD, userGender, userPhone, userPhone2, userPhone3, userMail, userAdd, userAdd_detail],
                (err, result, fields) => {
                    console.log(result);
                    console.log(err);
                    res.send("등록되었습니다.")
                }
                )
            });
        });
    }
})
//1. 적고나서, postman 열어서 테스트해보기  --> POST    http://localhost:8001/join 주소 입력
//Body - row에서 - JSON 클릭!!!!
//{
//     "userPass":"pink1234"        
// }
//이렇게 입력해줌 node index.js로 서버 돌려주고, 위의 값을 포스트맨에서 send 해주면
//터미널에 $2b$10$yqFyBvW/4iPvBJj5bxBideNicGpBFKIesx.BLPOqAXLOVWKI2TqIi   이런식으로 뜬다  --> pink1234가 암호화된거!
//2. 적고나서, postman으로 테스트  (위에와 주소랑 Body-row -JSON는 같음)
// {
//     "userId":"pink",
//     "userName":"핑크",
//     "userPass":"pink1234",
//     "userGender":"남자",
//     "userPhone":"010",
//     "userPhone2":"1234",
//     "userPhone3":"1234",
//     "userMail":"abc@naver.com"
// }            //등록일은 바로 지정해줘서 이렇게만! 배열에 들어갈 애들만 넣어주기(null이 아닌애들만)
//send보내면, 밑에 등록되었습니다. 가 뜨고 / mysql workbench에서 member table에서 값들이 잘 추가입력된 걸 볼 수 있다!

// 회원가입 - id 중복 확인
app.get('/idCheck', async (req,res)=>{
    connection.query(
        "select userid from member",
        (err, rows, fields)=> {
            res.send(rows);
            console.log(err);
        }
    )
})

// 로그인 요청
app.post('/login', async (req, res)=> {
    // - 2개만 받아올거임 id인 userId와 비밀번호인 userPass
    // ✔userId값에 일치하는 데이터가 있는지 select문 1234 -> #dfwew2rE 이런식으로 이상하게 암호화돼서
    //   입력한 userPass를 암호화 해서 쿼리 결과의 패스워드와 일치하는지를 체크
    // - 사용자가 회원가입시 1111로 비밀번호를 가입했는데 mysql에 값이 담길 때는 암호화되어서 $2b$10$wzNRbu9ndmQnw2CZ5H2HFuD.vMDLqnRAmrpE2sUo7SQFHPOf2TKn6 이런식으로 담기니까
    //   사용자가 로그인시, 입력한 비밀번호인 1111을 다시 암호화하고 mysql에 담긴 암호화된 비밀번호와 두개가 일치하는지 비교하게 할거임!!!
    const { userId, userPass } = req.body;
    connection.query(`select * from member where userid = '${userId}'`,
        (err, rows, fileds)=>{
            if(rows != undefined) {     //결과가 있을 때
                if(rows[0] == undefined) {
                    // res.send(null)
                    res.send("실패1");
                    // console.log(err);
                } else {
                    // Load hash from your password DB.
                    //https://www.npmjs.com/package/bcrypt 에서 긁어오기 (To check a password: 여기서!!! 맨 위의 주석빼고 위에 두줄만 적어주기)
                    bcrypt.compare(userPass, rows[0].password, function(err, result) {  //rows[0].password : hash자리  --> 암호화한 비번
                        // result == true
                        if(result == true) {
                            res.send(rows[0])
                        } else {
                            console.log(err);
                            res.send('실패2')
                        }
                    });
                }
            } else {
                res.send('실패')
            }
        }
    )
})
// 로그인 - 로그인시 해당 아이디가 있는지 체크
app.get('/getId/:id', async (req,res)=>{
    const params = req.params;
    const { id } = params;
    connection.query(
        `select userid from member where userid='${id}'`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// <장바구니>
// 1. 장바구니
app.get('/cart/:idid', async (req, res)=>{
    const params = req.params;
    const { idid } = params;
    connection.query(
        `select * from cart where userid='${idid}'`,
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
            // console.log(fields);
        }
    )
})

// 1-1. 장바구니 총 금액 구하기
app.get('/total/:idid', async (req,res)=>{
    const params = req.params;
    const { idid } = params;
    connection.query(
        `select sum(saleprice*amount) as total from cart where user_id='${idid}'`,
        (err, rows, fields)=>{
            res.send(rows[0]);
        }
    )
})

// 1-2. 장바구니에 추가
app.put('/addCart', async (req,res)=>{
    const body = req.body;
    const { c_userid, c_name, c_span, c_saleprice, c_amount, c_img, c_select } = body;
    console.log(c_name)
    const total = Number(c_amount) * Number(c_saleprice);
    connection.query(
        `select * from cart where userid='${c_userid}' and name='${c_name}'`,
        (err, rows, fields)=>{
            if(rows.length == 1) {
                res.send('있음');
            } else {
                connection.query(
                    "insert into cart(userid, name, span, saleprice, amount, imgsrc, select_option) values(?,?,?,?,?,?,?)",
                    [c_userid, c_name, c_span, c_saleprice, c_amount, c_img, c_select],
                    (err, rows, fields)=>{
                        res.send(rows);
                        console.log(err);
                    }
                )
            }
        }
    )
})

// 1-3. 장바구니 삭제
app.delete('/delCart/:id', async (req,res)=>{
    const params = req.params;
    const { id } = params;
    console.log("카트 삭제");
    connection.query(
        `delete from cart where id='${id}'`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// - 찜하기
// 하트 가져오기
app.get('/getheart/:userid', async (req, res)=>{
    const userid = req.params.userid;
    connection.query(
        `select * from likes where userid = '${userid}';`,
        (err, rows, fileds) => {
            if(err) res.send('no heart yet');
            res.send(rows);
        }
    )
})
// // 하트 넣기
// app.post('/addheart', async (req)=>{
//     const { userId, projectTitle, projectImg, releaseDate, deadLine, projectPrice, projectAchieve, sellerId, projectId} = req.body;
//     connection.query(
//         `insert into likes (userId, projectTitle, projectImg, releaseDate, deadLine, projectPrice, projectAchieve, sellerId, projectId) value(?,?,?,?,?,?,?,?,?)`,
//         [ userId, projectTitle, projectImg, releaseDate, deadLine, projectPrice, projectAchieve, sellerId, projectId ],
//         (err) => {
//             if(err) console.log(err);
//         }
//     )
// })
// // 하트 삭제
// app.delete('/deleteheart/:title', async (req, res)=>{
//     const title = req.params.title;
//     connection.query(`delete from likes where projectTitle='${title}'`,
//     (err)=>{
//         if(err) console.log(err);
//     })
// })

// <상품리뷰>
// 1. 리뷰 뿌리기 (제품 상세페이지에서 해당 제품의 리뷰들을 출력하기)
app.get("/review/:product", async (req,res)=>{
    // const params = req.params;
    const {product} = req.params;
    connection.query(
        `select * from review where name = '${product}' order by id desc`,
    (err,rows,fields)=>{
        res.send(rows);
        console.log(err);
    })
})

// 1-2. 리뷰 작성하기
app.post('/addReview', async (req, res)=>{
    const { userid, name, reviewtitle, reviewdesc, reviewimg, reviewstar, date } = req.body;
    console.log(req.body);
        connection.query(
            "insert into review(`userid`,`name`,`reviewtitle`,`reviewdesc`,`reviewimg`,`reviewstar`,`date`) values(?,?,?,?,?,?,?)",
            [userid, name, reviewtitle, reviewdesc, reviewimg, reviewstar, date],
            (err, rows, fileds)=>{
                res.send(rows);
                console.log('리뷰작성!!!!')
                console.log(err);
            }
        )
})

// 1-3. 리뷰 수정
app.put('/editReview/:id', async (req, res)=>{
    const params = req.params;
    const { userid, name, reviewtitle, reviewdesc, reviewimg, reviewstar, date } = req.body;
    console.log(req.body)
    connection.query(`UPDATE review SET userid='${userid}', name='${name}', reviewtitle='${reviewtitle}', reviewdesc='${reviewdesc}', revieimg='${reviewimg}', reviewstar='${reviewstar}', date='${date}' where id=${params.id}`,
    (err, result, fields)=>{
        if(err) {
            console.log("에러발생!!");
            console.log(err);
        }
        res.send(result);
    })
})

// 1-4. 리뷰 삭제 ( id로 확인 )
// app.post("/delReview/:id", async (req,res)=>{
//     const params = req.params
//     const { id } = params
//     connection.query(
//         `DELETE FROM review where id = '${id}'`,
//         (err,rows,fields)=>{         
//               res.send(rows); 
//         }
//     )
// })
app.delete("/delReview/:id", async (req,res)=>{
    const params = req.params
    const { id } = params
    connection.query(
        `DELETE FROM review where id = '${id}'`,
        (err,rows,fields)=>{         
              res.send(rows); 
        }
    )
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
// 1-5. notice 수정
app.put('/editNotice/:id', async (req, res)=>{
    const params = req.params;
    const { c_title, c_date, c_address1, c_address2, c_img1, c_img2, c_img3, c_img4, c_img5, c_desc, c_view } = req.body;
    console.log(req.body)
    //int인거는 '따옴표'필요X / varchar이면 '따옴표' 꼭 적어주기! --> 실수,,!
    connection.query(`UPDATE news_notice SET title='${c_title}', date='${c_date}', address='${c_address1}', address2='${c_address2}', imgsrc='${c_img1}', imgsrc2='${c_img2}', imgsrc3='${c_img3}', imgsrc4='${c_img4}', imgsrc5='${c_img5}', noticedesc='${c_desc}', view=${c_view} where id=${params.id}`,
    (err, result, fields)=>{
        if(err) {
            console.log("에러발생!!");
            console.log(err);
        }
        res.send(result);
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
// 1-1. news 뉴스 상세보기
app.get('/news/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from news_news where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
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
// 2-3. news 등록
app.post('/registerNews', async (req, res) => {
    const { c_title, c_date, c_address, c_view } = req.body;
    // console.log(req.body);
    connection.query("INSERT INTO news_news(`title`,`date`,`address`,`view`) values(?,?,?,?)",
    [c_title, c_date, c_address, c_view],
    (err, results, fields)=>{
        if(results){
            console.log(results);
            res.send("게시글 등록이 완료되었습니다.");
        }
       
    })
})
// 2-4. news 수정
app.put('/editNews/:id', async (req, res)=>{
    const params = req.params;
    const { c_title, c_date, c_address, c_view } = req.body;
    connection.query(`UPDATE news_news SET title='${c_title}', date='${c_date}', address='${c_address}', view=${c_view} where id=${params.id}`,
    (err, result, fields)=>{
        if(err) {
            console.log("에러발생!!");
            console.log(err);
        }
        res.send(result);
    })
})
// 2-5. news 삭제
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

// <GAME>
// 1. 게임 일정 등록
app.get('/calendars', async (req, res)=>{
    connection.query(
        "select * from game_calendar",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// // 1. 게임 일정 등록
// app.get('/calendars/:date', async (req, res)=>{
//     const params = req.params;
//     connection.query(
//         `select * from game_calendar where date=${params.date}`,
//         (err, rows, fields)=>{
//             res.send(rows);
//             console.log(err);
//         }
//     )
// })


// <Fan>
// 1. Youtube 유튜브 전체(아이디로..!)
app.get('/youtubes', async (req, res)=>{
    connection.query(
        "select * from fan_youtube order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. Youtube 유튜브 클릭전 - 제일 최근 영상 재생
app.get('/youtubeLatest', async (req, res)=>{
    connection.query(
        "select * from fan_youtube order by id desc limit 0,1",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-2. Youtube 유튜브 클릭시 - 상세
app.get('/youtube/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from fan_youtube where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 
// 1-3. Youtube 조회수
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


// 2. Photo 사진 전체
app.get('/photos', async (req, res)=>{
    connection.query(
        "select * from fan_photo order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 2-1. photo 상세보기 - detail
app.get('/photo/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from fan_photo where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 
// 2-2. photo 조회수
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
// 2-3. photo 등록
app.post('/registerPhoto', async (req, res) => {
    const { c_title, c_date, c_sort, c_img, c_img1, c_img2, c_img3, c_img4, c_view } = req.body;
    connection.query("INSERT INTO fan_photo(`title`,`date`,`sort`,`imgsrc`,`imgsrc1`,`imgsrc2`,`imgsrc3`,`imgsrc4`,`view`) values(?,?,?,?,?,?,?,?,?)",
    [c_title, c_date, c_sort, c_img, c_img1, c_img2, c_img3, c_img4, c_view],
    (err, results, fields)=>{
        if(results){
            console.log(results);
            res.send("사진이 등록이 완료되었습니다.");
        }
       
    })
})
// 2-4. photo 수정
app.put('/editPhoto/:id', async (req, res)=>{
    const params = req.params;
    const { c_title, c_date, c_sort, c_img, c_img1, c_img2, c_img3, c_img4, c_view } = req.body;
    connection.query(`UPDATE fan_photo SET title='${c_title}', date='${c_date}', sort='${c_sort}', imgsrc='${c_img}', imgsrc1='${c_img1}', imgsrc2='${c_img2}', imgsrc3='${c_img3}', imgsrc4='${c_img4}', view=${c_view} where id=${params.id}`,
    (err, result, fields)=>{
        if(err) {
            console.log("에러발생!!");
            console.log(err);
        }
        res.send(result);
    })
})
// 2-5. photo 삭제
app.delete('/delPhoto/:id', async (req, res)=>{
    const params = req.params;
    console.log("사진 삭제");
    connection.query(`delete from fan_photo where id = ${params.id}`,
    (err, rows, fields) => {
        res.send(rows);
        console.log(err);
    })    
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

// <STORE>
// 1. store 전체 뿌리기(신규등록순)
app.get('/stores', async (req, res)=>{
    connection.query(
        "select * from store order by id desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. store 전체 뿌리기(랭킹순)
app.get('/storesRank', async (req, res)=>{
    connection.query(
        "select * from store order by ranking asc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. store 전체 뿌리기(낮은가격순)
app.get('/storesLow', async (req, res)=>{
    connection.query(
        "select * from store order by saleprice asc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-1. store 전체 뿌리기(높은가격순)
app.get('/storesHigh', async (req, res)=>{
    connection.query(
        "select * from store order by saleprice desc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// // 1-1. store 전체 뿌리기(상품평많은순)
// app.get('/storesReview', async (req, res)=>{
//     connection.query(
//         "select * from store order by review desc",
//         (err, rows, fields)=>{
//             res.send(rows);
//             console.log(err);
//         }
//     )
// })
// 1-1. store 전체 뿌리기(판매량순)
app.get('/storesSell', async (req, res)=>{
    connection.query(
        "select * from store order by sellrank asc",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
// 1-2. store 상세보기 - detail
app.get('/store/:id', async (req, res)=>{
    const params = req.params;
    connection.query(
        `select * from store where id=${params.id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
}) 
// 1-3. store - prouct 등록하기
app.post('/registerProduct', async (req, res) => {
    const { c_name, c_span, c_price, c_saleprice, c_discountper, c_seller, c_img, c_desc, c_desc2, c_sort, c_ranking, c_review, c_sellrank, c_delivery } = req.body;
    connection.query("INSERT INTO store(`name`,`span`,`price`,`saleprice`,`discountper`,`seller`,`imgsrc`,`imgdesc`,`imgdesc2`,`sortcategory`,`ranking`,`review`,`sellrank`,`delivery`) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [c_name, c_span, c_price, c_saleprice, c_discountper, c_seller, c_img, c_desc, c_desc2, c_sort, c_ranking, c_review, c_sellrank, c_delivery],
    (err, results, fields)=>{
        if(results){
            console.log(results);
            res.send("상품 등록이 완료되었습니다.");
        }    
    })
})
// 1-4. store - prouct 수정
app.put('/editProduct/:id', async (req, res)=>{
    const params = req.params;
    const { c_name, c_span, c_price, c_saleprice, c_discountper, c_seller, c_img, c_desc, c_desc2, c_sort, c_ranking, c_review, c_sellrank, c_delivery } = req.body;
    connection.query(`UPDATE store SET name='${c_name}', span='${c_span}', price=${c_price}, saleprice=${c_saleprice}, discountper='${c_discountper}', seller='${c_seller}', sortcategory='${c_sort}', imgsrc='${c_img}', imgdesc='${c_desc}', imgdesc2='${c_desc2}', ranking='${c_ranking}', review='${c_review}', sellrank='${c_sellrank}', delivery='${c_delivery}'  where id=${params.id}`,
    (err, result, fields)=>{
        if(err) {
            console.log("에러발생!!");
            console.log(err);
        }
        res.send(result);
    })
})
// 1-5. store - prouct 삭제
app.delete('/delProduct/:id', async (req, res)=>{
    const params = req.params;
    // console.log("상품 삭제");
    connection.query(`delete from store where id = ${params.id}`,
    (err, rows, fields) => {
        res.send(rows);
        console.log(err);
    })    
})

// 서버실행
app.listen(port, () => {
    console.log('서버가 돌아가고 있습니다.');
})