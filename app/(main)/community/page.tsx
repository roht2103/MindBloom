'use client';

import React, { useState } from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';

export default function CommunityPage() {
  const { posts, addPost, reactToPost, profile } = useMindBloom();
  const [newPostContent, setNewPostContent] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  
  // Track comment input states per post ID
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  // Track toggled comment views per post ID
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    addPost(newPostContent);
    setNewPostContent('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleReaction = (postId: string, reactionType: 'hugs' | 'support' | 'calm') => {
    reactToPost(postId, reactionType);
  };

  const toggleCommentsView = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (postId: string, val: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: val
    }));
  };

  const handlePostComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    // Find the post and add comment
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      const newComment = {
        id: Date.now().toString(),
        author: profile.name,
        content: commentText,
        timestamp: 'Just now'
      };
      
      // Update in local UI state list
      posts[postIndex].comments.push(newComment);
      
      // Reset input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));
      // Expand comments if not already
      setShowComments(prev => ({
        ...prev,
        [postId]: true
      }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <section>
        <h1 className="text-2xl font-display font-extrabold text-on-surface">Positive Community Board</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          A non-judgmental space for students and professionals to share encouragement, support, and zen moments.
        </p>
      </section>

      {/* Main post box and posts feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Feed list */}
        <section className="lg:col-span-8 space-y-5">
          {posts.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-10 font-medium bg-surface-container-lowest rounded-lg border">
              No encouragement posts shared yet. Be the first to start!
            </p>
          ) : (
            posts.map(post => {
              const commentsCount = post.comments.length;
              const hasComments = commentsCount > 0;
              
              return (
                <div 
                  key={post.id} 
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm space-y-4"
                >
                  {/* Author metadata banner */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm"
                      style={{ borderRadius: '50%' }}
                    >
                      {post.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        {post.author}
                        <span className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                          {post.role}
                        </span>
                      </h4>
                      <span className="text-[10px] text-on-surface-variant font-semibold">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs leading-relaxed text-on-surface font-medium">
                    {post.content}
                  </p>

                  {/* Reactions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/10 select-none">
                    <div className="flex items-center gap-2">
                      {/* Hugs Reaction */}
                      <button
                        onClick={() => handleReaction(post.id, 'hugs')}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          post.userReaction === 'hugs'
                            ? 'bg-secondary/15 text-secondary border border-secondary/20 scale-95'
                            : 'bg-surface hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/15'
                        }`}
                      >
                        <span>🤗</span>
                        <span>Hugs ({post.reactions.hugs})</span>
                      </button>

                      {/* Support Reaction */}
                      <button
                        onClick={() => handleReaction(post.id, 'support')}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          post.userReaction === 'support'
                            ? 'bg-primary/15 text-primary border border-primary/20 scale-95'
                            : 'bg-surface hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/15'
                        }`}
                      >
                        <span>❤️</span>
                        <span>Support ({post.reactions.support})</span>
                      </button>

                      {/* Calm Reaction */}
                      <button
                        onClick={() => handleReaction(post.id, 'calm')}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          post.userReaction === 'calm'
                            ? 'bg-tertiary/15 text-tertiary border border-tertiary/20 scale-95'
                            : 'bg-surface hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/15'
                        }`}
                      >
                        <span>🍃</span>
                        <span>Calm ({post.reactions.calm})</span>
                      </button>
                    </div>

                    {/* Comments Toggle */}
                    <button
                      onClick={() => toggleCommentsView(post.id)}
                      className="text-xs text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">comment</span>
                      <span>Comments ({commentsCount})</span>
                    </button>
                  </div>

                  {/* Comments section */}
                  {showComments[post.id] && (
                    <div className="space-y-3.5 pt-3 border-t border-outline-variant/10">
                      {/* Comments stream list */}
                      {hasComments && (
                        <div className="space-y-3 bg-surface p-3.5 rounded-lg border border-outline-variant/10">
                          {post.comments.map(comment => (
                            <div 
                              key={comment.id} 
                              className="text-xs border-b border-outline-variant/10 last:border-b-0 pb-2 last:pb-0"
                            >
                              <div className="flex justify-between items-start font-bold">
                                <span className="text-on-surface">{comment.author}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium">{comment.timestamp}</span>
                              </div>
                              <p className="text-on-surface-variant mt-1 leading-relaxed font-semibold">
                                {comment.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input form */}
                      <form 
                        onSubmit={(e) => handlePostComment(post.id, e)} 
                        className="flex gap-3 items-center"
                      >
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          placeholder="Write a supportive reply..."
                          className="flex-1 bg-surface border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary placeholder-on-surface-variant/40 leading-relaxed font-medium"
                        />
                        <button
                          type="submit"
                          disabled={!(commentInputs[post.id] || '').trim()}
                          className="bg-primary text-on-primary hover:bg-primary/95 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          Reply
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </section>

        {/* Right: Add Post box + safety guidelines */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Post creator */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-display font-bold text-on-surface">Share Encouragement</h3>
            
            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share a positive reflection, quote, or support message..."
                rows={4}
                className="w-full bg-surface border border-outline-variant/30 rounded-lg p-3 text-xs focus:outline-none focus:border-primary placeholder-on-surface-variant/40 leading-relaxed font-medium"
              />
              
              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="w-full inline-flex items-center justify-center bg-primary text-on-primary hover:bg-primary/95 py-2.5 rounded-lg text-xs font-bold shadow-md shadow-primary/10 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">send</span>
                Post to Feed (+40 XP)
              </button>
            </form>

            {successMsg && (
              <p className="text-center text-xs font-bold text-secondary animate-pulse">
                ✓ Uplifting post submitted! XP credited.
              </p>
            )}
          </section>

          {/* Platform Guidelines */}
          <section className="bg-secondary/5 border border-secondary/15 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[20px]">security</span>
              <h3 className="text-xs font-display font-bold">Board Rules</h3>
            </div>
            <ul className="text-[10px] leading-relaxed text-on-surface-variant font-medium list-disc pl-4 space-y-1.5">
              <li>Keep all interactions positive, encouraging, or constructive.</li>
              <li>Refrain from venting details of severe trauma or self-harm; redirect to emergency resources.</li>
              <li>Keep all identities confidential. Respect members' privacy settings.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
