import type { Knex } from 'knex';

/**
 * This migration adds a bidirectional relationship between users and consultants
 * by adding a consultant field to the user collection.
 */

export async function up(knex: Knex): Promise<void> {
  // Add the consultant relation field to the users collection
  await knex.schema.alterTable('up_users', (table) => {
    // Note: This is a virtual field for the relation, so we don't actually add a column
    // The relationship is managed by Strapi's ORM
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove the consultant relation field from the users collection
  await knex.schema.alterTable('up_users', (table) => {
    // Note: This is a virtual field for the relation, so we don't actually remove a column
    // The relationship is managed by Strapi's ORM
  });
} 