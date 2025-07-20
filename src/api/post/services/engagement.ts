import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::post.post', ({ strapi }) => ({
  async addReaction(postId: string, userId: string, type: string) {
    try {
      const reactionService = strapi.service('api::reaction.reaction');
      
      // Check if reaction already exists
      const existingReaction = await reactionService.findMany({
        filters: {
          post: { id: postId },
          user: { id: userId },
          reaction_type: type as any
        }
      });

      if (existingReaction.length > 0) {
        return existingReaction[0];
      }

      // Create new reaction
      const reaction = await reactionService.create({
        data: {
          post: postId,
          user: userId,
          reaction_type: type as any,
        }
      });

      // Update post engagement score
      await this.updateEngagementScore(postId);

      return reaction;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  async removeReaction(postId: string, userId: string, type: string) {
    try {
      const reactionService = strapi.service('api::reaction.reaction');
      
      // Find and delete the reaction
      const reactions = await reactionService.findMany({
        filters: {
          post: { id: postId },
          user: { id: userId },
          reaction_type: type as any
        }
      });

      if (reactions.length > 0) {
        await reactionService.delete(reactions[0].documentId || reactions[0].id);
      }

      // Update post engagement score
      await this.updateEngagementScore(postId);
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  async toggleSave(postId: string, userId: string) {
    try {
      const saveService = strapi.service('api::save.save');
      
      // Check if already saved
      const existingSave = await saveService.findMany({
        filters: {
          post: { id: postId },
          user: { id: userId }
        }
      });

      if (existingSave.length > 0) {
        // Remove save
        await saveService.delete(existingSave[0].documentId || existingSave[0].id);
        return { saved: false };
      } else {
        // Add save
        const save = await saveService.create({
          data: {
            post: postId,
            user: userId
          }
        });
        return { saved: true, save };
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  },

  async addShare(postId: string, userId: string, type: string) {
    try {
      const shareService = strapi.service('api::share.share');
      
      const share = await shareService.create({
        data: {
          post: postId,
          user: userId,
          share_type: type as any,
        }
      });

      // Update post engagement score
      await this.updateEngagementScore(postId);

      return share;
    } catch (error) {
      console.error('Error adding share:', error);
      throw error;
    }
  },

  async recordView(postId: string, userId: string, duration?: number) {
    try {
      const viewService = strapi.service('api::view.view');
      
      // Check if view already exists for today
      const today = new Date().toISOString().split('T')[0];
      const existingViews = await viewService.findMany({
        filters: {
          post: { id: postId },
          user: { id: userId },
          date: today
        }
      });

      if (existingViews.length > 0) {
        const view = existingViews[0];
        const newDuration = (view.view_duration || 0) + (duration || 0);
        
        return await viewService.update(view.documentId || view.id, {
          data: {
            view_count: (view.view_count || 0) + 1,
            view_duration: newDuration
          }
        });
      } else {
        // Create new view
        return await viewService.create({
          data: {
            post: postId,
            user: userId,
            view_count: 1,
            view_duration: duration || 0,
            date: today as any
          }
        });
      }
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  },

  async updateEngagementScore(postId: string) {
    try {
      const postService = strapi.service('api::post.post');
      const post = await postService.findOne(postId, {
        populate: {
          reactions: true,
          comments: true,
          saves: true,
          shares: true,
          views: true
        }
      });

      if (!post) {
        throw new Error('Post not found');
      }

      // Calculate engagement metrics
      const reactions = (post as any).reactions || [];
      const comments = (post as any).comments || [];
      const saves = (post as any).saves || [];
      const shares = (post as any).shares || [];
      const views = (post as any).views || [];

      // Calculate weighted engagement score
      let engagementScore = 0;

      // Reaction weights
      reactions.forEach((reaction: any) => {
        engagementScore += this.getReactionWeight(reaction.reaction_type);
      });

      // Comment weight
      engagementScore += comments.length * 3;

      // Save weight
      engagementScore += saves.length * 2;

      // Share weight
      engagementScore += shares.length * 4;

      // View weight (capped to prevent spam)
      engagementScore += Math.min(views.length, 100) * 0.1;

      // Update post with new engagement score
      await postService.update(postId, {
        data: {
          engagement_score: Math.round(engagementScore),
          reaction_count: reactions.length,
          comment_count: comments.length,
          save_count: saves.length,
          share_count: shares.length,
          view_count: views.length
        }
      });

      return engagementScore;
    } catch (error) {
      console.error('Error updating engagement score:', error);
      throw error;
    }
  },

  getReactionWeight(type: string): number {
    const weights: { [key: string]: number } = {
      like: 1,
      love: 2,
      celebrate: 2,
      insightful: 3,
      helpful: 3
    };
    return weights[type] || 1;
  },

  async getPostEngagement(postId: string) {
    try {
      const postService = strapi.service('api::post.post');
      const post = await postService.findOne(postId, {
        populate: {
          reactions: true,
          comments: true,
          saves: true,
          shares: true,
          views: true
        }
      });

      if (!post) {
        throw new Error('Post not found');
      }

      return {
        reactions: (post as any).reactions || [],
        comments: (post as any).comments || [],
        saves: (post as any).saves || [],
        shares: (post as any).shares || [],
        views: (post as any).views || [],
        engagement_score: post.engagement_score || 0
      };
    } catch (error) {
      console.error('Error getting post engagement:', error);
      throw error;
    }
  },

  async getUserReaction(postId: string, userId: string) {
    try {
      const reactionService = strapi.service('api::reaction.reaction');
      const reactions = await reactionService.findMany({
        filters: {
          post: { id: postId },
          user: { id: userId }
        }
      });

      return reactions.length > 0 ? reactions[0] : null;
    } catch (error) {
      console.error('Error getting user reaction:', error);
      throw error;
    }
  },

  async getUserSave(postId: string, userId: string) {
    try {
      const saveService = strapi.service('api::save.save');
      const saves = await saveService.findMany({
        filters: {
          post: { id: postId },
          user: { id: userId }
        }
      });

      return saves.length > 0 ? saves[0] : null;
    } catch (error) {
      console.error('Error getting user save:', error);
      throw error;
    }
  }
}));