FROM mysql:latest

# any .sql placed here is auto-imported by the MySQL image on first startup,
# creating the schema and seeding the data
COPY ./dev_meetings.sql /docker-entrypoint-initdb.d/
