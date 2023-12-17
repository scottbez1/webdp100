import { FRAME_FUNC, Frame } from "./hid-reports"

export type BasicInfo = {
    vin: number,
    vout: number,
    iout: number,
    vo_max: number,
    temp1: number,
    temp2: number,
    dc_5V: number,
    out_mode: number,
    work_st: number,
}
export const basicInfoFromFrame = (frame: Frame): BasicInfo => {
    if (frame.functionType !== FRAME_FUNC.FRAME_BASIC_INFO) {
        throw new Error("basicInfoFromFrame called with invalid frame data")
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

export type BasicSet = {
    index: number,
    state: number,
    vo_set: number,
    io_set: number,
    ovp_set: number,
    ocp_set: number,
}
export const basicSetFromFrame = (frame: Frame): BasicSet => {
    if (frame.functionType !== FRAME_FUNC.FRAME_BASIC_SET) {
        throw new Error("basicSetFromFrame called with invalid frame data")
    }
    const dataDv = new DataView(new Uint8Array(frame.data).buffer, 0, frame.dataLen)
    return {
        index: dataDv.getUint8(0),
        state: dataDv.getUint8(1),
        vo_set: dataDv.getUint16(2, true),
        io_set: dataDv.getUint16(4, true),
        ovp_set: dataDv.getUint16(6, true),
        ocp_set: dataDv.getUint16(8, true),
    }
}
export const basicSetFrameData = (basicSet: BasicSet): Uint8Array => {
    const out = new Uint8Array(10)
    const outDv = new DataView(out.buffer, out.byteOffset, out.length)
    outDv.setUint8(0, basicSet.index)
    outDv.setUint8(1, basicSet.state)
    outDv.setUint16(2, basicSet.vo_set, true)
    outDv.setUint16(4, basicSet.io_set, true)
    outDv.setUint16(6, basicSet.ovp_set, true)
    outDv.setUint16(8, basicSet.ocp_set, true)
    return out
}
