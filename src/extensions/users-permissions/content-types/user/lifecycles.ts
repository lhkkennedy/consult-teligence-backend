export default {
  async afterCreate(event) {
    const { result } = event;
    const userId = result.id;

    // Create a consultant entry linked to this user
    await strapi.entityService.create('api::consultant.consultant', {
      data: {
        user: userId,
        // Optionally, copy over fields from the user or set defaults
        firstName: result.username, // or result.firstname if you have it
        // ...other fields as needed
      },
    });
  },
}; 