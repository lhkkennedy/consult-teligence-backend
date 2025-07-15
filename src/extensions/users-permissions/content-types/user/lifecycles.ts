export default {
  async afterCreate(event) {
    const { result } = event;
    const userId = result.id;

    console.log('afterCreate lifecycle triggered for user:', userId);

    try {
      const consultant = await strapi.service('api::consultant.consultant').create({
        data: {
          user: userId,
          firstName: result.username,
        },
      });
      console.log('Consultant created:', consultant);
    } catch (err) {
      console.error('Error creating consultant:', err);
    }
  },
}; 