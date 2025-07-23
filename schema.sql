DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id    TEXT PRIMARY KEY,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender        TEXT
);

INSERT INTO students (student_id, first_name, last_name, date_of_birth, gender)
VALUES ('D1-TEST-001', 'ทดสอบ', 'ดีหนึ่ง', '2024-01-01', 'อื่น ๆ');