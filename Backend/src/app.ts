import express, { json } from 'express'
import config from 'config'
import cors from 'cors'
import sequelize from './db/sequelize'
import teamsRouter from './routers/teams'
import meetingsRouter from './routers/meetings'
import notFound from './middlewares/not-found'
import logError from './middlewares/error/log-error'
import respondError from './middlewares/error/error-responder'

(async () => {
    const port = config.get<number>('app.port')
    const name = config.get<string>('app.name')

    const app = express()

    // middlewares
    app.use('/', cors())
    app.use('/', json())
    app.use('/teams', teamsRouter)
    app.use('/meetings', meetingsRouter)
    app.use('/', notFound)

    // error middlewares
    app.use('/', logError)
    app.use('/', respondError)

    // connect to the database and verify the models match the tables.
    // {force: false} so we never drop the imported data.
    await sequelize.sync({ force: !!config.get('app.sync.force') })

    app.listen(port, () => console.log(`app ${name} started on port ${port}....`))
})()
