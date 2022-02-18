import 'mocha'
import { strict as assert } from 'assert'
import { KoaRouterManager } from '../src/router'
import { state } from '../src/state'
import { validateState } from '../src/validate'

describe('http-server router test suite', () => {
  let router: KoaRouterManager
  beforeEach(() => {
    router = new KoaRouterManager()
  })

  it('state(kvMap)', async () => {
    @router.controller()

    class FakeController {
      @router.get('getFunc')
      @state({
        queryKey: ['query.key'],
        bodyKey: ['request.body.key'],
      }, router)
      async getFunc(state) {
        assert.ok(state)
        assert.equal(state.queryKey, undefined)
        assert.equal(state.bodyKey, 'correct')
        assert.equal(state.otherKey, undefined)
      }
    }
    
    const koaRouter = router.getRouter()
    const ctx: any = {
      method: 'GET',
      path: '/getFunc',
      headers: {},
      query: {},
      request: { body: { key: 'correct', key2: 'other' } },
    }
    const next: any = () => { }
    await koaRouter.routes()(ctx, (() => {}) as any)
  })

  it('state()', async () => {
    @router.controller()

    class FakeController {
      @router.get('getFunc')
      @state(null, router)
      async getFunc(state) {
        assert.ok(state)
        assert.equal(state.queryKey, undefined)
        assert.equal(state.key, 'correct')
        assert.equal(state.key2, 'other')
      }
    }
    
    const koaRouter = router.getRouter()
    const ctx: any = {
      method: 'GET',
      path: '/getFunc',
      headers: {},
      query: {},
      request: { body: { key: 'correct', key2: 'other' } },
    }
    const next: any = () => { }
    await koaRouter.routes()(ctx, (() => {}) as any)
  })

  it('validateState()', async () => {
    @router.controller()

    class FakeController {
      @router.get('getFunc')
      @state(null, router)
      @validateState({
        type: 'object',
        required: ['key'],
        properties: {
          key3: { type: 'integer' },
        },
      }, { routerManager: router })
      async getFunc(state) {
        assert.ok(state)
        assert.equal(state.queryKey, undefined)
        assert.equal(state.key, 'correct')
        assert.equal(state.key2, 'other')
        assert.equal(state.key3, 123)
      }
    }
    
    const koaRouter = router.getRouter()
    const ctx: any = {
      method: 'GET',
      path: '/getFunc',
      headers: {},
      query: {},
      request: { body: { key: 'correct', key2: 'other', key3: '123' } },
    }
    const next: any = () => { }
    await koaRouter.routes()(ctx, (() => {}) as any)
  })

  it('validateState() fail', async () => {
    @router.controller()

    class FakeController {
      @router.get('getFunc')
      @state(null, router)
      @validateState({
        type: 'object',
        required: ['key'],
        properties: {
          key3: { type: 'integer' },
        },
      }, { routerManager: router })
      async getFunc(state) {
        assert.ok(state)
        assert.equal(state.queryKey, undefined)
        assert.equal(state.key, 'correct')
        assert.equal(state.key2, 'other')
        assert.equal(state.key3, 123)
      }
    }
    
    const koaRouter = router.getRouter()
    const ctx: any = {
      method: 'GET',
      path: '/getFunc',
      headers: {},
      query: {},
      request: { body: { } },
    }
    await assert.rejects(koaRouter.routes()(ctx, (() => {}) as any), {
      message: '/ must have required property \'key\''
    })
  })
})
