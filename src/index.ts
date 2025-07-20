// // import type { Core } from '@strapi/strapi';

interface StrapiInstance {
  db: {
    lifecycles: {
      subscribe: (config: any) => void;
    };
    query: (entity: string) => {
      create: (data: any) => Promise<any>;
      findOne: (query: any) => Promise<any>;
    };
  };
  log: {
    warn: (message: string, data?: any) => void;
    info: (message: string) => void;
    error: (message: string, data?: any) => void;
  };
}

interface UserEvent {
  result: {
    id: number;
    username?: string;
    lastName?: string;
    location?: string;
    company?: string;
    currentRole?: string;
    availability?: string;
  };
}

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
  bootstrap({ strapi }: { strapi: StrapiInstance }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],
      async afterCreate(event: UserEvent) {
        const { result } = event;
        
        // Only create consultant if user has required fields
        if (!result || !result.id || !result.username) {
          strapi.log.warn("User creation event missing required fields:", result);
          return;
        }

        try {
          // Check if consultant already exists for this user
          const existingConsultant = await strapi.db
            .query("api::consultant.consultant")
            .findOne({
              where: { user: result.id }
            });

          if (existingConsultant) {
            strapi.log.info(`Consultant already exists for user ${result.id}`);
            return;
          }

          const consultant = await strapi.db
            .query("api::consultant.consultant")
            .create({
              data: {
                user: result.id,
                firstName: result.username,
                // Set default values for required fields
                lastName: result.lastName || '',
                location: result.location || '',
                company: result.company || '',
                currentRole: result.currentRole || '',
                availability: result.availability || 'Available'
              },
            });
          
          strapi.log.info(`Successfully created consultant ${consultant.id} for user ${result.id}`);
        } catch (err) {
          const error = err as Error;
          strapi.log.error("Failed to create consultant for user", {
            userId: result.id,
            error: error.message,
            stack: error.stack
          });
        }
      },
    });
  },
};
