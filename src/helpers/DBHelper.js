const mysql2 = require('mysql2/promise');

const getConnection = async () => {
    try {

        const pool = mysql2.createPool({
            host: process.env.DB_Host,
            user: process.env.DB_User,
            password: process.env.DB_Password,
            port: process.env.DB_Port,
            database: process.env.DB_Name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        return pool;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    getConnection
}