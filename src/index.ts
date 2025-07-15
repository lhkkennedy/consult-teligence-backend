// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],
      async afterCreate(event) {
        const { result } = event;
        console.log("afterCreate fired for user:", result.id);
        try {
          await strapi.db
            .query("api::consultant.consultant")
            .create({
              data: {
                user: result.id,
                // Map other fields as needed, e.g.:
                firstName: result.username,
              },
            });
            console.log("Consultant created for user:", result.id);
        } catch (err) {
          strapi.log.error("Failed to create consultant for user", err);
        }
        console.log("After try/catch for user:", result.id);
      },
    });
  },
};
