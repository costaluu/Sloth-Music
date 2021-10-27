import EventEmitter from 'events'
import { enqueue, play, pauseUnpause, stop, skip, repeat, shuffle, leave, fairShuffle } from '../VoiceHandler'
import Logger from '../Logger'
import Configs from '../config.json'
import Client from '../Client'
const log = Logger('taskqueue.ts', Configs.TaskQueueLogLevel)

export class AsyncTaskQueue {
    public taskQueue: [string, any][]
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

                return
            } else {
                that.taskQueue.push([taskType, arg])

                log.debug(`Queue is empty, processing task...`)

                that.queue.emit('processNextTask')
            }
        })

        this.queue.on('processNextTask', async function () {
            if (that.taskQueue.length === 0) {
                log.success({ message: `Tasks done.`, level: 4 })
                return
            }

            let currentTask = that.taskQueue[0]

            let args: any[] = currentTask[1]

            log.debug(`Processing ${currentTask[0]}`)

            if (currentTask[0] === 'Enqueue') await enqueue(args[0], args[1], args[2])
            else if (currentTask[0] === 'Play') await play()
            else if (currentTask[0] === 'PlayResume') await pauseUnpause(args[0])
            else if (currentTask[0] === 'Stop') await stop(args[0])
            else if (currentTask[0] === 'Skip') await skip(args[0])
            else if (currentTask[0] === 'Repeat') await repeat(args[0])
            else if (currentTask[0] === 'ShuffleQueue') await shuffle(args[0])
            else if (currentTask[0] === 'Leave') await leave(args[0])
            else if (currentTask[0] === 'FairQueue') await fairShuffle(args[0])
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
