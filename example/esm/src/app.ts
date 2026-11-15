import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { errorHandlerMW, getRouterAsync } from '@tng/koa-controller'

const app = new Koa()

// Turns validation failures into `400 { "error": "..." }` responses
app.use(errorHandlerMW())
// Parses JSON request bodies into ctx.request.body
app.use(bodyParser())

// Auto-scan and load controller files using async import()
const router = await getRouterAsync({
  files: './src/api*.ts',
})
app.use(router.routes())

app.listen(4000, () => {
  console.log('ESM Example server running at http://localhost:4000')
})
