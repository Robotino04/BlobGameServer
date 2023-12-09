CREATE TABLE
    IF NOT EXISTS scoreboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gamemode VARCHAR(20) NOT NULL,
        username VARCHAR(35) NOT NULL,
        user_id VARCHAR(20) NOT NULL,
        score INTEGER NOT NULL,
        submission_time DATETIME
    )