const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::board.board", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // on force le filtre owner = user connecté
    ctx.query = {
      ...ctx.query,
      filters: { ...(ctx.query.filters || {}), owner: user.id },
    };

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // on récupère le board
    const entity = await strapi.entityService.findOne("api::board.board", ctx.params.id, {
      populate: ctx.query.populate,
    });

    if (!entity) return ctx.notFound();
    if (!entity.owner || entity.owner.id !== user.id) return ctx.forbidden();

   
    const sanitized = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitized);
  },
}));
