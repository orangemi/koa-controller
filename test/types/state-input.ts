import type { Context } from 'koa'
import { controller, post, stateInput, Type, type InputType } from '../../src/index.js'

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false
const assertType = <T extends true>(_?: T) => {}

const Fields = {
  id: Type.Number({ from: 'params', required: true }),
  content: Type.String({ required: true }),
  page: Type.Number({ from: 'query' }),
  ratio: Type.Number({ required: false }),
  draft: Type.Boolean(),
  tags: Type.Array(Type.String()),
  kind: Type.Enum(['a', 'b'], { required: true }),
  level: Type.Enum([1, 2]),
  userId: Type.Union([Type.String(), Type.Number()], { required: true }),
  mixed: Type.Union([Type.Number(), Type.Boolean()]),
  author: Type.Object({ name: Type.String({ required: true }), age: Type.Number() }, { required: true }),
}
type State = InputType<typeof Fields>
assertType<Equal<State, {
  id: number
  content: string
  kind: 'a' | 'b'
  author: { name: string, age?: number }
  userId: string | number
  page?: number
  ratio?: number
  draft?: boolean
  tags?: string[]
  level?: 1 | 2
  mixed?: number | boolean
}>>()

// @ts-expect-error unknown source
Type.Number({ from: 'param' })
// @ts-expect-error headers are not a source
Type.String({ from: 'headers' })
// @ts-expect-error default is not supported
Type.Number({ default: 1 })
// @ts-expect-error constraints are not supported
Type.String({ minLength: 1 })

@controller('/x')
export class C {
  @post('/ok')
  @stateInput(Fields)
  async ok(state: State, ctx: Context) { return [state, ctx] }

  @post('/inline')
  @stateInput({ id: Type.Number({ from: 'params', required: true }), q: Type.String({ from: 'query' }) })
  async inline(state: { id: number, q?: string }) { return state }

  @post('/wider')
  @stateInput(Fields)
  async wider(state: { id: number }) { return state }

  @post('/none')
  @stateInput(Fields)
  async none() {}

  @post('/unknown')
  @stateInput(Fields)
  async unknownState(state: unknown) { return state }

  @post('/wrong-type')
  // @ts-expect-error id is a number, not a string
  @stateInput(Fields)
  async wrongType(state: { id: string }) { return state }

  @post('/optional-as-required')
  // @ts-expect-error page is optional
  @stateInput(Fields)
  async optionalAsRequired(state: { page: number }) { return state }

  @post('/missing-field')
  // @ts-expect-error nope is not declared
  @stateInput(Fields)
  async missingField(state: { nope: string }) { return state }
}
