import mysql.connector
import os
import json

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
                state VARCHAR(100),
                district VARCHAR(100),
                country VARCHAR(100),
                is_active TINYINT(1) DEFAULT 1
            )
        ''')
        cur.execute('''
            INSERT INTO instructors (name, is_active)
            SELECT %s, %s FROM DUAL
            WHERE NOT EXISTS (
                SELECT 1 FROM instructors WHERE name = %s
            )
        ''', ('Sadguru Deo', 1, 'Sadguru Deo'))
        cur.execute('''
                CREATE TABLE IF NOT EXISTS event_registrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_name VARCHAR(255) NOT NULL,
                    event_date DATE NOT NULL,
                    instructor_id INT,
                    coordinator VARCHAR(255),
                    total_attendance INT DEFAULT 0,
                    location VARCHAR(255),
                    state VARCHAR(100),
                    district VARCHAR(100),
                    country VARCHAR(100),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (instructor_id) REFERENCES instructors(id)
                );
                ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS members (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    number VARCHAR(50) NOT NULL,
                    email VARCHAR(255),
                    age VARCHAR(50),
                    gender VARCHAR(10),
                    address VARCHAR(255),
                    state VARCHAR(100),
                    district VARCHAR(100),
                    country VARCHAR(100),
                    company VARCHAR(255),
                    notes TEXT,
                    instructor_id INT,
                    event_id INT,
                    date_of_initiation DATE NOT NULL,
                    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
                    FOREIGN KEY (event_id) REFERENCES event_registrations(id)
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


        # Insert default "Not Specified" event if not present
        cur.execute('''
        INSERT INTO event_registrations (event_name, event_date)
        SELECT %s, CURDATE()
        FROM DUAL
        WHERE NOT EXISTS (
            SELECT 1 FROM event_registrations WHERE event_name = %s
        )
        ''', ('Not Specified', 'Not Specified'))

        # Create tables
        cur.execute('''
            CREATE TABLE IF NOT EXISTS Country (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS State (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                country_id INT,
                UNIQUE(name, country_id),
                FOREIGN KEY (country_id) REFERENCES Country(id) ON DELETE CASCADE
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS City (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                state_id INT,
                UNIQUE(name, state_id),
                FOREIGN KEY (state_id) REFERENCES State(id) ON DELETE CASCADE
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS logged_in_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                username VARCHAR(150) NOT NULL,
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_key VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ''')
        conn.commit()

        # Import data from JSON files
        # Check if Country table is empty before importing
        cur.execute("SELECT COUNT(*) FROM Country")
        if cur.fetchone()[0] == 0:
            self.import_countries(cur, conn)

        # Check if State table is empty before importing
        cur.execute("SELECT COUNT(*) FROM State")
        if cur.fetchone()[0] == 0:
            self.import_states(cur, conn)

        # Check if City table is empty before importing
        cur.execute("SELECT COUNT(*) FROM City")
        if cur.fetchone()[0] == 0:
            self.import_cities(cur, conn)

        cur.close()
        conn.close()

    def import_countries(self, cur, conn):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        countries_path = os.path.join(base_dir, 'member_manage', 'static', 'data', 'countries.json')
        with open(countries_path, encoding='utf-8') as f:
            countries = json.load(f)
        for c in countries:
            name = c.get('name') or c.get('country_name')
            if name:
                try:
                    cur.execute("INSERT IGNORE INTO Country (name) VALUES (%s)", (name,))
                except Exception as e:
                    print(f"Error inserting country {name}: {e}")
        conn.commit()
        print("Countries imported successfully.")

    def import_states(self, cur, conn):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        states_path = os.path.join(base_dir, 'member_manage','static', 'data', 'states.json')
        cur.execute("SELECT id, name FROM Country")
        country_map = {name: cid for cid, name in cur.fetchall()}
        with open(states_path, encoding='utf-8') as f:
            states = json.load(f)
        for s in states:
            name = s.get('name') or s.get('state_name')
            country_name = s.get('country_name')
            country_id = country_map.get(country_name)
            if name and country_id:
                try:
                    cur.execute(
                        "INSERT IGNORE INTO State (name, country_id) VALUES (%s, %s)",
                        (name, country_id)
                    )
                except Exception as e:
                    print(f"Error inserting state {name}: {e}")
        conn.commit()
        print("States imported successfully.")

    def import_cities(self, cur, conn):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cities_path = os.path.join(base_dir, 'member_manage','static', 'data', 'cities.json')
        cur.execute("SELECT id, name FROM State")
        state_map = {name: sid for sid, name in cur.fetchall()}
        with open(cities_path, encoding='utf-8') as f:
            cities = json.load(f)
        for c in cities:
            name = c.get('name') or c.get('city_name')
            state_name = c.get('state_name')
            state_id = state_map.get(state_name)
            if name and state_id:
                try:
                    cur.execute(
                        "INSERT IGNORE INTO City (name, state_id) VALUES (%s, %s)",
                        (name, state_id)
                    )
                except Exception as e:
                    print(f"Error inserting city {name}: {e}")
        conn.commit()
        print("Cities imported successfully.")
