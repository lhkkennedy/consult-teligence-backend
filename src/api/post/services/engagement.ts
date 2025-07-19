import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::post.post', ({ strapi }) => ({
  async addReaction(postId: string, userId: string, type: string) {
    // Check if user already reacted
    const existingReaction = await strapi.entityService.findMany('api::reaction.reaction', {
      filters: {
        post: postId,
        user: userId,
        reaction_type: type
      }
    });

    if (existingReaction.length > 0) {
      return existingReaction[0];
    }

    // Create new reaction
    const reaction = await strapi.entityService.create('api::reaction.reaction', {
      data: {
        reaction_type: type,
        user: userId,
        post: postId,
        weight: this.getReactionWeight(type)
      }
    });

    // Update post engagement score
    await this.calculateEngagementScore(postId);

    return reaction;
  },

  async removeReaction(postId: string, userId: string) {
    await strapi.entityService.deleteMany('api::reaction.reaction', {
      filters: {
        post: postId,
        user: userId
      }
    });

    // Update post engagement score
    await this.calculateEngagementScore(postId);
  },

  async addComment(postId: string, userId: string, body: string, parentCommentId?: string) {
    const comment = await strapi.entityService.create('api::comment.comment', {
      data: {
        body,
        user: userId,
        post: postId,
        parent_comment: parentCommentId
      }
    });

    // Update post engagement score
    await this.calculateEngagementScore(postId);

    return comment;
  },

  async savePost(postId: string, userId: string, collection: string = 'default', notes?: string) {
    // Check if already saved
    const existingSave = await strapi.entityService.findMany('api::save.save', {
      filters: {
        post: postId,
        user: userId
      }
    });

    if (existingSave.length > 0) {
      // Update existing save
      return await strapi.entityService.update('api::save.save', existingSave[0].id, {
        data: {
          collection,
          notes
        }
      });
    }

    // Create new save
    const save = await strapi.entityService.create('api::save.save', {
      data: {
        collection,
        notes,
        user: userId,
        post: postId
      }
    });

    // Update post save count
    await this.updatePostCounts(postId, 'save_count', 1);

    return save;
  },

  async unsavePost(postId: string, userId: string) {
    await strapi.entityService.deleteMany('api::save.save', {
      filters: {
        post: postId,
        user: userId
      }
    });

    // Update post save count
    await this.updatePostCounts(postId, 'save_count', -1);
  },

  async sharePost(postId: string, userId: string, type: string, platform?: string) {
    const share = await strapi.entityService.create('api::share.share', {
      data: {
        share_type: type,
        share_platform: platform,
        user: userId,
        post: postId,
        recipient_count: 1
      }
    });

    // Update post share count
    await this.updatePostCounts(postId, 'share_count', 1);

    return share;
  },

  async trackView(postId: string, userId: string, duration?: number, source: string = 'feed') {
    // Check if view already exists for this session
    const existingView = await strapi.entityService.findMany('api::view.view', {
      filters: {
        post: postId,
        user: userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Within 30 minutes
      }
    });

    if (existingView.length > 0) {
      // Update existing view
      const view = existingView[0];
      const newDuration = (view.view_duration || 0) + (duration || 0);
      
      return await strapi.entityService.update('api::view.view', view.id, {
        data: {
          view_duration: newDuration,
          is_complete: newDuration > 30, // Consider complete if viewed for more than 30 seconds
          source
        }
      });
    }

    // Create new view
    const view = await strapi.entityService.create('api::view.view', {
      data: {
        view_duration: duration || 0,
        is_complete: (duration || 0) > 30,
        source,
        user: userId,
        post: postId
      }
    });

    // Update post view count
    await this.updatePostCounts(postId, 'view_count', 1);

    return view;
  },

  async calculateEngagementScore(postId: string) {
    const post = await strapi.entityService.findOne('api::post.post', postId, {
      populate: ['reactions', 'comments', 'saves', 'shares', 'views']
    });

    if (!post) return 0;

    let score = 0;

    // Calculate score based on reactions
    const reactions = post.reactions || [];
    reactions.forEach(reaction => {
      score += this.getReactionWeight(reaction.reaction_type) * (reaction.weight || 1);
    });

    // Add points for comments
    const comments = post.comments || [];
    score += comments.length * 5;

    // Add points for saves
    const saves = post.saves || [];
    score += saves.length * 10;

    // Add points for shares
    const shares = post.shares || [];
    score += shares.length * 15;

    // Add points for views (weighted less)
    const views = post.views || [];
    score += views.length * 1;

    // Update post with new engagement score
    await strapi.entityService.update('api::post.post', postId, {
      data: {
        engagement_score: score
      }
    });

    return score;
  },

  async updatePostCounts(postId: string, field: string, increment: number) {
    const post = await strapi.entityService.findOne('api::post.post', postId);
    if (!post) return;

    const currentValue = post[field] || 0;
    const newValue = Math.max(0, currentValue + increment);

    await strapi.entityService.update('api::post.post', postId, {
      data: {
        [field]: newValue
      }
    });
  },

  getReactionWeight(type: string): number {
    const weights = {
      like: 1,
      love: 2,
      celebrate: 3,
      insightful: 4,
      helpful: 5
    };
    return weights[type] || 1;
  },

  async getPostEngagement(postId: string) {
    const post = await strapi.entityService.findOne('api::post.post', postId, {
      populate: {
        reactions: {
          populate: ['user']
        },
        comments: {
          populate: ['user', 'replies']
        },
        saves: {
          populate: ['user']
        },
        shares: {
          populate: ['user']
        },
        views: {
          populate: ['user']
        }
      }
    });

    if (!post) return null;

    return {
      reactions: post.reactions || [],
      comments: post.comments || [],
      saves: post.saves || [],
      shares: post.shares || [],
      views: post.views || [],
      engagement_score: post.engagement_score || 0
    };
  },

  async getUserReaction(postId: string, userId: string) {
    const reactions = await strapi.entityService.findMany('api::reaction.reaction', {
      filters: {
        post: postId,
        user: userId
      }
    });

    return reactions[0] || null;
  },

  async isPostSaved(postId: string, userId: string) {
    const saves = await strapi.entityService.findMany('api::save.save', {
      filters: {
        post: postId,
        user: userId
      }
    });

    return saves.length > 0;
  }
}));