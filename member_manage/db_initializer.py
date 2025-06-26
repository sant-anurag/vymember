import mysql.connector

class DBInitializer:
    def __init__(self, host, user, password, database):
        self.conn_params = {
            'host': host,
            'user': user,
            'password': password
        }
        self.database = database

    def initialize(self):
        # Connect without database to create it if needed
        conn = mysql.connector.connect(**self.conn_params)
        cur = conn.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{self.database}`")
        cur.close()
        conn.close()

        # Now connect to the created database and create tables
        db_conn_params = self.conn_params.copy()
        db_conn_params['database'] = self.database
        conn = mysql.connector.connect(**db_conn_params)
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                is_admin TINYINT DEFAULT 0,
                created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS instructors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                age INT,
                dop DATE,
                associated_since YEAR,
                updeshta_since YEAR,
                address VARCHAR(255),
                is_active TINYINT(1) DEFAULT 1
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS members (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    number VARCHAR(50) NOT NULL,
                    email VARCHAR(255),
                    address VARCHAR(255),
                    state VARCHAR(100),
                    district VARCHAR(100),
                    country VARCHAR(100),
                    company VARCHAR(255),
                    notes TEXT,
                    instructor_id INT,
                    date_of_initiation DATE NOT NULL,
                    FOREIGN KEY (instructor_id) REFERENCES instructors(id)
                )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                activity_type VARCHAR(100),
                description TEXT,
                date DATETIME,
                FOREIGN KEY(member_id) REFERENCES members(id)
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS deals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                deal_name VARCHAR(255),
                value DECIMAL(12,2),
                status VARCHAR(50),
                created_at DATETIME,
                FOREIGN KEY(member_id) REFERENCES members(id)
            )
        ''')
        conn.commit()
        cur.close()
        conn.close()