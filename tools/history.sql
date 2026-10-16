-- Benchmark data (MySQL): adds 40 copies of the seeded bookings as past visits, 9 days apart. Run after tools/loadtest.mjs on a LOCAL test database.
CREATE TEMPORARY TABLE k (n INT PRIMARY KEY);
INSERT INTO k VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),(31),(32),(33),(34),(35),(36),(37),(38),(39),(40);
INSERT INTO appointment (id, name, email, date, time, description, regtime, doctor_id, doctor_name, department, status, has_prescription, reminder_sent)
SELECT a.id + k.n * 1000000, a.name, a.email, DATE_FORMAT(DATE_SUB(a.date, INTERVAL k.n * 9 DAY), '%Y-%m-%d'), a.time, a.description, a.regtime,
       a.doctor_id, a.doctor_name, a.department, IF(k.n % 7 = 0, 'CANCELLED', 'COMPLETED'), 0, 1
FROM appointment a JOIN k WHERE a.id < 1000000;
UPDATE appointment_seq SET next_val = (SELECT MAX(id) + 100 FROM appointment);
SELECT COUNT(*) AS appointments FROM appointment;
