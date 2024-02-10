create database retro3_dev;
create user retro3 password 'retro3';
grant all privileges on database retro3_dev to retro3;
\c retro3_dev
CREATE EXTENSION pg_trgm;
CREATE EXTENSION unaccent;
