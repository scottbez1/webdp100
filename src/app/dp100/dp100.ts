import { useEffect } from "react";
import { FRAME_FUNC, Frame, crc16, inputReportDataToFrame } from "./hid-reports";
import { basicInfoFromFrame } from "./frame-data";

export const DP100_USB_INFO = { vendorId: 0x2e3c, productId: 0xaf01 }


export const useDP100 = ({device}: {device: HIDDevice}) => {

    const handleInputReport = (e: HIDInputReportEvent) => {
        console.log(e.device.productName + ": got input report " + e.reportId);

        const frame = inputReportDataToFrame(e.data.buffer)
        if (frame !== null && frame.functionType === FRAME_FUNC.FRAME_BASIC_INFO) {
            const basicInfo = basicInfoFromFrame(frame)
            console.log('basic info', basicInfo)
        }
      }

      useEffect(() => {
        device.addEventListener("inputreport", handleInputReport);
        return () => {
            device.removeEventListener("inputreport", handleInputReport);
        }
      }, [device])


    // construct GetBasic frame
    const frameData: Array<number> = []
    const frame = {
        deviceAddr: 251,
        functionType: FRAME_FUNC.FRAME_BASIC_INFO,
        sequence: 0,
        dataLen: frameData.length,
        data: frameData,
        // checksum added later
    }
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
    // NB: I'm not sure the checksum is being checked?
    const checksum = crc16(frameBuffer.slice(0, frameBuffer.length - 2))
    const frameBufferDv = new DataView(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength)
    frameBufferDv.setUint16(frameBuffer.length - 2, checksum, true); // little-endian
    console.log('FrameEntity', frameBuffer)

    const requestBasicInfo = async () => {
        await device.sendReport(0, frameBuffer);
    }

    return {
        requestBasicInfo
    }
}