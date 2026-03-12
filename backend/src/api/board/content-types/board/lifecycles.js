module.exports = {
  async beforeCreate(event) {
    const user = event.state.user;
    if (!user) return; // si pas connecté, pas d'owner auto
    event.params.data.owner = user.id;
  },
};