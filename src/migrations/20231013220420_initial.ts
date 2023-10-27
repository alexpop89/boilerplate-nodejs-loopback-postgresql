import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('first_name');
      table.string('last_name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('roles', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.json('conditions').notNullable();
      table.string('user_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('user_logs', table => {
      table.increments('id').primary();
      table.string('action').notNullable();
      table.json('data');
      table.integer('user_id').references('id').inTable('users');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('refresh_tokens', function (table) {
      table.increments('id').primary();
      table.string('value').notNullable();
      table.timestamp('expires');
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique('value');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_logs').dropTable('role').dropTable('user').dropTableIfExists('refresh_tokens');
}
