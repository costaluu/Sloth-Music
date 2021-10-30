import EventEmitter from 'events'
import { enqueue, play, toggle, stop, skip, repeat, shuffle, leave, fairShuffle, jump, remove } from '../VoiceHandler'
import Logger from '../Logger'
import Configs from '../config.json'
import Client from '../Client'
const log = Logger(Configs.TaskQueueLogLevel, 'taskqueue.ts')

class AsyncTaskQueue {
    public taskQueue: [string, any[]][]
    public queue: EventEmitter

    /**
     * Constructor, setup the listeners and queue
     * All taks have @args that can be used to do something more specifc
     */

    constructor() {
        this.taskQueue = []
        this.queue = new EventEmitter()

        let that = this

        this.queue.on('enqueueTask', function (taskType: string, arg: any) {
            if (that.taskQueue.length > 0) {
                log.debug(`Queue is busy, pushing to queue...`)

                that.taskQueue.push([taskType, arg])
            } else {
                that.taskQueue.push([taskType, arg])

                log.debug(`Queue is empty, processing task...`)

                that.queue.emit('processNextTask')
            }

            return
        })

        this.queue.on('processNextTask', async function () {
            if (that.taskQueue.length === 0) {
                log.info(`Tasks done.`)
                return
            }

            let currentTask: string = that.taskQueue[0][0]

            let args: any[] = that.taskQueue[0][1]

            log.debug(`Processing ${currentTask}`)

            if (currentTask === 'Enqueue') await enqueue(args[0], args[1])
            else if (currentTask === 'Play') await play()
            else if (currentTask === 'Toggle') await toggle(args[0])
            else if (currentTask === 'Stop') await stop(args[0])
            else if (currentTask === 'Skip') await skip(args[0])
            else if (currentTask === 'Repeat') await repeat(args[0])
            else if (currentTask === 'Shuffle') await shuffle(args[0])
            else if (currentTask === 'Leave') await leave(args[0])
            else if (currentTask === 'FairShuffle') await fairShuffle(args[0])
            else if (currentTask === 'Jump') await jump(args[0], args[1])
            else if (currentTask === 'Remove') await remove(args[0], args[1])
            /*             else if (currentTask[0] === 'PreviousPage') await previousQueuePage()
            else if (currentTask[0] === 'NextPage') await nextQueuePage() */

            that.taskQueue.shift()

            that.queue.emit('processNextTask')
        })
    }

    /**
     * Skips current song
     * @param {task} string id.
     * @param {arg} arguments for the task
     */

    enqueueTask(task: string, arg: any) {
        log.debug(`Putting ${task} task on queue... `)

        this.queue.emit('enqueueTask', task, arg)
    }
}

export default AsyncTaskQueue
