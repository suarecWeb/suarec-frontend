"use client";

import Link from "next/link";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Comment } from "@/interfaces/comment.interface";
import { UserAvatarDisplay } from "@/components/ui/UserAvatar";

interface CommentsProps {
  comments: Comment[];
  commentText: string;
  setCommentText: (text: string) => void;
  currentUserId: number | null;
  isSubmittingComment: boolean;
  onSubmitComment: () => void;
  formatDate: (dateString: Date | string) => string;
  formatTime: (dateString: Date | string) => string;
}

export const Comments = ({
  comments,
  commentText,
  setCommentText,
  currentUserId,
  isSubmittingComment,
  onSubmitComment,
  formatDate,
  formatTime,
}: CommentsProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#097EEC]" />
          Comentarios
          <span className="text-sm font-normal text-gray-500">
            ({comments.length})
          </span>
        </h3>
      </div>

      {/* Lista de comentarios con scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                {comment.user?.id &&
                comment.user.id !== "" &&
                comment.user.id !== "undefined" ? (
                  <Link
                    href={`/profile/${comment.user.id}`}
                    className="hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                  >
                    <UserAvatarDisplay
                      user={{
                        id:
                          typeof comment.user?.id === "string"
                            ? parseInt(comment.user.id)
                            : (comment.user?.id as number) || 0,
                        name: comment.user?.name || "Usuario",
                        profile_image: comment.user?.profile_image,
                      }}
                      size="sm"
                    />
                  </Link>
                ) : (
                  <UserAvatarDisplay
                    user={{
                      id:
                        typeof comment.user?.id === "string"
                          ? parseInt(comment.user.id)
                          : (comment.user?.id as number) || 0,
                      name: comment.user?.name || "Usuario",
                      profile_image: comment.user?.profile_image,
                    }}
                    size="sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {comment.user?.id &&
                  comment.user.id !== "" &&
                  comment.user.id !== "undefined" ? (
                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="hover:text-[#097EEC] transition-colors cursor-pointer"
                    >
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {comment.user?.name || "Usuario"}
                      </p>
                    </Link>
                  ) : (
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {comment.user?.name || "Usuario"}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-1">
                    {formatDate(comment.created_at)} •{" "}
                    {formatTime(comment.created_at)}
                  </p>
                  <p className="text-sm text-gray-700 break-words">
                    {comment.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No hay comentarios aún</p>
            <p className="text-gray-400 text-xs mt-1">
              ¡Sé el primero en comentar!
            </p>
          </div>
        )}
      </div>

      {/* Form de comentario fijo en la parte inferior */}
      <div className="border-t border-gray-200 bg-white p-4">
        {currentUserId ? (
          <div className="space-y-3">
            <textarea
              placeholder="Escribe un comentario..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none text-sm"
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmittingComment}
            />
            <button
              className="w-full px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#097EEC]/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm font-medium"
              disabled={!commentText.trim() || isSubmittingComment}
              onClick={onSubmitComment}
            >
              {isSubmittingComment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Comentar
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-gray-600">
              <Link
                href="/auth/login"
                className="text-[#097EEC] hover:underline font-medium"
              >
                Inicia sesión
              </Link>{" "}
              para comentar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
