import { PointerComponent } from './pointer'
import { updateDom } from './dom'
import { reduxStore, PlayerTypes, ProgressState, getTime } from '@WebReplay/utils'
import { ProgressComponent } from './progress'
import { ContainerComponent } from './container'
import { RecordData } from '@WebReplay/record'

const LIVE = Symbol('live')
export class PlayerComponent {
    mode: Symbol
    data: RecordData[]
    speed = 0
    index = 0
    frameIndex = 0
    lastPercentage = 0
    isFirstTimePlay = true
    frames: number[]
    requestID: number
    startTime: number
    c: ContainerComponent
    pointer: PointerComponent
    progress: ProgressComponent
    progressState: ProgressState

    constructor(data: RecordData[], c: ContainerComponent, pointer: PointerComponent, progress: ProgressComponent) {
        this.data = data
        this.c = c
        this.pointer = pointer
        this.progress = progress

        if (!data.length) {
            // is live mode
            this.mode = LIVE
            window.addEventListener('record-data', (e: CustomEvent) => {
                const frame = e.detail as RecordData
                this.execFrame(frame)
            })
        } else {
            reduxStore.subscribe('player', state => {
                this.progressState = reduxStore.getState()['progress']
                const speed = state.speed
                this.speed = speed
                if (speed > 0) {
                    this.play()
                } else {
                    this.pause()
                }
                this.frames = this.getAccuratelyFrame()
            })
        }
    }

    play() {
        if (this.index === 0) {
            this.progress.resetThumb()
            if (!this.isFirstTimePlay) {
                this.c.setViewState()
            }
            this.isFirstTimePlay = false
        }
        cancelAnimationFrame(this.requestID)
        this.requestID = requestAnimationFrame(loop.bind(this))

        const initTime = getTime()
        this.startTime = 0

        function loop(this: PlayerComponent) {
            const timeStamp = getTime() - initTime
            if (this.frameIndex > 0 && !this.frames[this.frameIndex]) {
                this.stop()
                return
            }
            if (!this.startTime) {
                this.startTime = Number(this.frames[this.frameIndex])
            }

            const currTime = this.startTime + timeStamp * this.speed
            const nextTime = Number(this.frames[this.frameIndex])

            if (currTime >= nextTime) {
                this.renderEachFrame(currTime)
            }

            this.requestID = requestAnimationFrame(loop.bind(this))
        }
    }

    renderEachFrame(time: number) {
        const { startTime } = this.progressState
        this.progress.updateTimer((time - startTime) / 1000)
        const progress = (this.frameIndex / (this.frames.length - 1)) * 100
        this.progress.updateProgress(progress)
        let data: RecordData
        while (+(data = this.data[this.index]).time <= this.frames[this.frameIndex]) {
            this.execFrame.call(this, data)
            this.index++
            if (this.index === this.data.length) {
                break
            }
        }
        this.frameIndex++
    }

    pause() {
        cancelAnimationFrame(this.requestID)
        reduxStore.dispatch({
            type: PlayerTypes.SPEED,
            data: {
                speed: 0
            }
        })
    }

    stop() {
        this.speed = 0
        this.index = 0
        this.frameIndex = 0
        this.lastPercentage = 0
        this.pause()
    }

    execFrame(this: PlayerComponent, record: RecordData) {
        updateDom.call(this, record)
    }

    getPercentInterval() {
        const k = 0.08
        const b = 0.2
        return this.speed * k + b
    }

    getAccuratelyFrame(interval = 250) {
        this.progressState = reduxStore.getState()['progress']
        const { startTime, endTime } = this.progressState

        const s = +startTime
        const e = +endTime

        const result: number[] = []

        for (let i = s; i < e; i += interval) {
            result.push(i)
        }
        result.push(e)
        return result
    }
}
