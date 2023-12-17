import { FRAME_FUNC, Frame } from "./hid-reports"

export const basicInfoFromFrame = (frame: Frame) => {
    if (frame.functionType !== FRAME_FUNC.FRAME_BASIC_INFO) {
        throw new Error("readBasicInfo called with invalid frame data")
    }
    const dataDv = new DataView(new Uint8Array(frame.data).buffer, 0, frame.dataLen)
    return {
        vin: dataDv.getUint16(0, true),
        vout: dataDv.getUint16(2, true),
        iout: dataDv.getUint16(4, true),
        vo_max: dataDv.getUint16(6, true),
        temp1: dataDv.getUint16(8, true),
        temp2: dataDv.getUint16(10, true),
        dc_5V: dataDv.getUint16(12, true),
        out_mode: dataDv.getUint8(14),
        work_st: dataDv.getUint8(15),
    }
}
