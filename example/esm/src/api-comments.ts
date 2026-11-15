import { controller, get, post, stateInput, validateState, Type, type InputType } from '@tng/koa-controller'

// In-memory storage, to keep the example self-contained.
interface Comment {
  id: number
  postId: number
  content: string
  author: string
  tags: string[]
}
const comments: Comment[] = []

// Where each field of `state` comes from, and its TypeScript type.
// Fields come from the request body and are optional unless stated otherwise.
const CreateComment = {
  postId: Type.Number({ from: 'params', required: true }),
  content: Type.String({ required: true }),
  author: Type.String({ required: true }),
  tags: Type.Array(Type.String()),
  notify: Type.Boolean({ from: 'query' }),
}

const ListComments = {
  postId: Type.Number({ from: 'params', required: true }),
  page: Type.Number({ from: 'query' }),
  sort: Type.Enum(['asc', 'desc'], { from: 'query' }),
}

@controller('/posts')
export class CommentController {
  // curl -X POST 'localhost:4000/posts/1/comments?notify=true' \
  //   -H 'content-type: application/json' \
  //   -d '{"content":"Nice post","author":"ann","tags":["hello"]}'
  @post('/:postId/comments')
  @stateInput(CreateComment)
  // @stateInput only picks the fields; @validateState is what checks and
  // converts them. Without it, `postId` would still be the string "1".
  @validateState({
    type: 'object',
    required: ['postId', 'content', 'author'],
    properties: {
      postId: { type: 'integer', minimum: 1 },
      content: { type: 'string', minLength: 1 },
      author: { type: 'string', minLength: 1 },
      tags: { type: 'array', items: { type: 'string' } },
      notify: { type: 'boolean' },
    },
  })
  async create(state: InputType<typeof CreateComment>) {
    // state: {
    //   postId: number; content: string; author: string;
    //   tags?: string[]; notify?: boolean
    // }
    const comment: Comment = {
      id: comments.length + 1,
      postId: state.postId,
      content: state.content,
      author: state.author,
      tags: state.tags ?? [],
    }
    comments.push(comment)
    return { comment, notified: state.notify ?? false }
  }

  // curl 'localhost:4000/posts/1/comments?page=1&sort=desc'
  @get('/:postId/comments')
  @stateInput(ListComments)
  @validateState({
    type: 'object',
    required: ['postId'],
    properties: {
      postId: { type: 'integer', minimum: 1 },
      page: { type: 'integer', minimum: 1 },
      sort: { type: 'string', enum: ['asc', 'desc'] },
    },
  })
  async list(state: InputType<typeof ListComments>) {
    const pageSize = 10
    const page = state.page ?? 1
    const found = comments.filter(comment => comment.postId === state.postId)
    if (state.sort === 'desc') found.reverse()
    return {
      page,
      total: found.length,
      comments: found.slice((page - 1) * pageSize, page * pageSize),
    }
  }

  // No @validateState here, to show what @stateInput does on its own: values
  // are copied as they arrive, so `postId` is a string despite Type.Number.
  // curl 'localhost:4000/posts/1/raw?page=2&other=ignored'
  @get('/:postId/raw')
  @stateInput(ListComments)
  async raw(state: InputType<typeof ListComments>) {
    return { state, typeofPostId: typeof state.postId }
  }
}
