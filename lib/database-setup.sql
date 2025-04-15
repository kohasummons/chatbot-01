-- Create Patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT
);

-- Create Dentists table
CREATE TABLE dentists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL
);

-- Create Appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) NOT NULL,
  dentist_id INTEGER REFERENCES dentists(id) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('booked', 'cancelled'))
);

-- Insert the default dentist (Dr. Smith)
INSERT INTO dentists (id, name, specialization)
VALUES (1, 'Dr. Smith', 'General Dentistry');

-- Insert test appointments (to be used in testing the check_availability function)
-- First, insert a test patient
INSERT INTO patients (id, name, email, phone)
VALUES (1, 'Test Patient', 'test@example.com', '123-456-7890');

-- Then insert test appointments for 2023-11-01 at 09:00 and 10:00
INSERT INTO appointments (patient_id, dentist_id, date, time, status)
VALUES 
  (1, 1, '2023-11-01', '09:00:00', 'booked'),
  (1, 1, '2023-11-01', '10:00:00', 'booked'); 