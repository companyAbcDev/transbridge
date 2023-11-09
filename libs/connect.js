const mysql = require('mysql2/promise');
const MAX_RETRY = 100;

async function getConnection(conn_db) {
    console.log("================= getConnection Call");

    let pool = null;
    let connection = null;
    try {
        pool = mysql.createPool(conn_db);
        connection = await pool.getConnection(async conn => conn);
    } catch (err) {
        console.log("getConnection - err : ============= " + err);
    }
    return connection;
}

function releaseConnection(connection) {
    console.log("================= releaseConnection Call");
    connection.release();
}

function sleep(ms) {
    console.log("================= sleep Call");
    return new Promise(function(resolve){
        setTimeout(resolve,ms);
    });
}

async function runQuery(connection, strQuery, args) {
    let result, nCnt;
    for (nCnt = 0; nCnt < MAX_RETRY; nCnt++) {
        try {
            // console.log("result1 : ============= " + result);
            // console.log("nCnt : ============= " + nCnt);
            // console.log("args : ============= " + args);
            if (args != "") {
                // console.log("args - strQuery : ============= " + strQuery);
                result = await connection.query(strQuery, args);
                // console.log("args - result : ============= " + result);
            } else {
                // console.log("strQuery : ============= " + strQuery);
                result = await connection.query(strQuery);
                // console.log("result2 : ============= " + result);
            }
            break;
        } catch (err) {
            if (nCnt >= MAX_RETRY - 1) {
                throw err;
            }
            await sleep(200);
        }
    }
    return result;
}

module.exports = {
    getConnection,
    releaseConnection,
    sleep,
    runQuery
}