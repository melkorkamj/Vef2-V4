require('dotenv').config();

const { query } = require('./db');

const connectionString = process.env.DATABASE_URL;

const schema = `
CREATE TABLE assignments (
  id serial primary key,
  title character varying(128) UNIQUE NOT NULL,
  due timestamp default current_timestamp,
  position int default 0,
  completed boolean default false,
  created timestamp not null default current_timestamp,
  updated timestamp not null default current_timestamp
  );
  INSERT INTO assignments (title, due, position, completed)
  VALUES ('Skrá í vefforritun 2', null, 1, true);
  INSERT INTO assignments (title, due, position, completed)
  VALUES ('Sækja verkefni 4 á github', null, 2, false);
  INSERT INTO assignments (title, due, position, completed)
  VALUES ('Klára verkefni 4', null, 3, false);
  INSERT INTO assignments (title, due, position, completed)
  VALUES ('Setja verkefni 4 upp á Heroku', null, 4, false);
  INSERT INTO assignments (title, due, position, completed)
  VALUES ('Skila verkefni 4', '2019-03-08 23:59:59', 6, false);
`;

async function main() {
  console.info(`Set upp gagnagrunn á ${connectionString}`);
  // droppa töflu ef til
  await query('DROP TABLE IF EXISTS assignments');
  console.info('Töflu eytt');

  // búa til töflur út frá skema
  try {
    await query(schema);
    console.info('Tafla búin til');
  } catch (e) {
    console.error('Villa við að búa til töflu:', e.message);
  }
}

main().catch((err) => {
  console.error(err);
});
