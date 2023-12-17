import { useEffect, useMemo } from "react";
import { FRAME_FUNC, Frame, inputReportDataToFrame } from "./hid-reports";
import { BasicInfo, BasicSet, basicInfoFromFrame, basicSetFrameData, basicSetFromFrame } from "./frame-data";
import { crc16modbus } from "crc";

export const DP100_USB_INFO = { vendorId: 0x2e3c, productId: 0xaf01 }

export class DP100 {
    private readonly device: HIDDevice
    public constructor(device: HIDDevice) {
        this.device = device
    }


    // TODO: Leaking memory?
    private pendingTask: Promise<void> = Promise.resolve()


    private async sendFrameForResponse(frame: Frame, expectedFunctionResponse: number) {
        return new Promise<Frame>((reqResolve, reqReject) => {
            this.pendingTask = this.pendingTask.then(async () => {
                console.log('starting new task')
                return new Promise<void>((taskResolve) => {
                    // TODO: timeout to prevent queue backup

                    const eventListener = (e: HIDInputReportEvent) => {
                        console.log(e.device.productName + ": got input report " + e.reportId);
                        const frame = inputReportDataToFrame(e.data.buffer)
                        if (frame !== null && frame.functionType === expectedFunctionResponse) {
                            success(frame)
                        }
                    }
                    const success = (result: any) => {
                        this.device.removeEventListener('inputreport', eventListener)
                        reqResolve(result)
                        taskResolve()
                    }
                    const failure = (error: any) => {
                        this.device.removeEventListener('inputreport', eventListener)
                        reqReject(error)
                        taskResolve()
                    }
                    console.log('registering listener')
                    this.device.addEventListener('inputreport', eventListener)
                    this.sendFrame(frame)
                })
            })
        })
    }

    private async sendFrame(frame: Frame) {
        const frameBuffer = new Uint8Array([
            frame.deviceAddr,
            frame.functionType,
            frame.sequence,
            frame.dataLen,
            ...frame.data,
            0,
            0,
        ]);
        // checksum
        const checksum = crc16modbus(frameBuffer.slice(0, frameBuffer.length - 2))
        const frameBufferDv = new DataView(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength)
        frameBufferDv.setUint16(frameBuffer.length - 2, checksum, true); // little-endian

        console.log('sendReport', frameBuffer)
        await this.device.sendReport(0, frameBuffer);
    }

    public async getBasicInfo(): Promise<BasicInfo> {
        // construct GetBasic frame
        const frameData = new Uint8Array(0);
        const frame: Frame = {
            deviceAddr: 251,
            functionType: FRAME_FUNC.FRAME_BASIC_INFO,
            sequence: 0,
            dataLen: frameData.length,
            data: frameData,
        }
        const response = await this.sendFrameForResponse(frame, FRAME_FUNC.FRAME_BASIC_INFO)
        const basicInfo = basicInfoFromFrame(response)
        console.log('basic info', basicInfo)
        return basicInfo
    }

    public async getCurrentBasic(): Promise<BasicSet> {
        const index = 0 // CurrentBasicIndex seems to always be 0???
        const frameData = new Uint8Array([index | 0x80]); // Not sure why the | 0x80 is done here...
        const frame: Frame = {
            deviceAddr: 251,
            functionType: FRAME_FUNC.FRAME_BASIC_SET,
            sequence: 0,
            dataLen: frameData.length,
            data: frameData,
        }
        const response = await this.sendFrameForResponse(frame, FRAME_FUNC.FRAME_BASIC_SET)
        const basicSet = basicSetFromFrame(response)
        console.log('basic set', basicSet)
        return basicSet
    }

    public async setBasic(set: BasicSet): Promise<boolean> {
        const copy = {...set}
        copy.index = copy.index | 0x20 // 0x20 is presumably a bit mask, but not sure what it means (other than 0x80 seems to be "read"; see above)
        const frameData = basicSetFrameData(copy)
        const frame: Frame = {
            deviceAddr: 251,
            functionType: FRAME_FUNC.FRAME_BASIC_SET,
            sequence: 0,
            dataLen: frameData.length,
            data: frameData,
        }
        const response = await this.sendFrameForResponse(frame, FRAME_FUNC.FRAME_BASIC_SET)
        console.log('setBasic response', response)
        return response.data[0] === 1
    }
}

export const useDP100 = (device: HIDDevice) => {
    return useMemo(() => {
        return new DP100(device)
    }, [device])
}
