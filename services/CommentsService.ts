import api from "./axios_config";

const baseURL = "/comments";

interface Comment {
  id?: string;
  description: string;
  created_at: Date;
  publicationId: string;
  userId: string;
}

const getComments = () => api.get<Comment[]>(baseURL);

const getCommentById = (id: string) => api.get<Comment>(`${baseURL}/${id}`);

const createComment = (commentData: Comment) => api.post<Comment>(baseURL, commentData);

const updateComment = (id: string, commentData: Partial<Comment>) => api.patch<Comment>(`${baseURL}/${id}`, commentData);

const deleteComment = (id: string) => api.delete(`${baseURL}/${id}`);

const CommentService = {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};

export default CommentService;
