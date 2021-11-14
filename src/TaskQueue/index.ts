import EventEmitter from 'events'
import * as tasks from '../VoiceHandler'
import Logger from '../Logger'
import Configs from '../config.json'
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

            try {
                if (currentTask === 'updateMainQueueMessage') await tasks.updateQueueEmbedMessage()
                else if (currentTask === 'updateMainMessage') await tasks.updateMainEmbedMessage()
                else if (currentTask === 'Enqueue') await tasks.enqueue(args[0], args[1], args[2])
                else if (currentTask === 'Play') await tasks.play()
                else if (currentTask === 'Toggle') await tasks.toggle(args[0], args[1])
                else if (currentTask === 'Pause') await tasks.pause(args[0], args[1])
                else if (currentTask === 'Unpause') await tasks.unpause(args[0], args[1])
                else if (currentTask === 'Stop') await tasks.stop(args[0], args[1])
                else if (currentTask === 'Skip') await tasks.skip(args[0], args[1], args[2])
                else if (currentTask === 'Repeat') await tasks.repeat(args[0], args[1])
                else if (currentTask === 'Shuffle') await tasks.shuffle(args[0], args[1])
                else if (currentTask === 'Leave') await tasks.leave(args[0], args[1])
                else if (currentTask === 'FairShuffle') await tasks.fairShuffle(args[0], args[1])
                else if (currentTask === 'Jump') await tasks.jump(args[0], args[1])
                else if (currentTask === 'Remove') await tasks.remove(args[0], args[1])
                else if (currentTask === 'Thread') await tasks.thread(args[0])
                else if (currentTask === 'PreviousPage') tasks.previousQueuePage()
                else if (currentTask === 'NextPage') tasks.nextQueuePage()
                else if (currentTask === 'Seek') tasks.seek(args[0], args[1])
                else if (currentTask === 'Bassboost') tasks.bassboost(args[0], args[1])

                if (
                    currentTask === 'Enqueue' ||
                    currentTask === 'Stop' ||
                    currentTask === 'Skip' ||
                    currentTask === 'Repeat' ||
                    currentTask === 'Shuffle' ||
                    currentTask === 'FairShuffle' ||
                    currentTask === 'Jump' ||
                    currentTask === 'Remove' ||
                    currentTask === 'PreviousPage' ||
                    currentTask === 'NextPage'
                ) {
                    that.enqueueTask('updateMainMessage', [null])
                    that.enqueueTask('updateMainQueueMessage', [null])
                }
            } catch (e) {
                log.warn(`Failed to execute ${currentTask}\n${e.stack}`)
            }

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
