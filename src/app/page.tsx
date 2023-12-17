'use client'

import styles from './page.module.css'
import { useRequestWebHIDDevice } from './webhid'
import { DP100_USB_INFO, useDP100 } from './dp100/dp100';
import { useEffect, useState } from 'react';
import { BasicInfo, BasicSet } from './dp100/frame-data';

const filters = [DP100_USB_INFO];

export default function Home() {
  const { requestAndOpen, device, errorMessage } = useRequestWebHIDDevice({requestOptions: {filters}})
  return (
    <main className={styles.main}>
      { device && (<DP100 device={device} />)}
      { device === null && requestAndOpen !== null ? <button onClick={requestAndOpen}>Connect</button> : null }
      { errorMessage && <div><b>{errorMessage}</b></div> }
    </main>
  )
}

interface IDP100Props {
  device: HIDDevice,
}
const DP100: React.FC<IDP100Props> = ({device}) => {
  const dp100 = useDP100(device)

  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null)
  const [basicSet, setBasicSet] = useState<BasicSet | null>(null)

  return (
    <>
    <div>
      Connected to <b>{device.productName}</b>
    </div>
    <div>
      <button onClick={() => dp100.setBasic({
        index: 0,
        state: 0,
        vo_set: 12000,
        io_set: 1000,
        ovp_set: 0,
        ocp_set: 0,
      })}>Set 12V 1A, off</button>
    </div>
    <div>
      <button onClick={() => dp100.setBasic({
        index: 0,
        state: 1,
        vo_set: 12000,
        io_set: 1000,
        ovp_set: 0,
        ocp_set: 0,
      })}>Set 12V 1A, ON</button>
    </div>
    <br />
    <div>
      <button onClick={async () => setBasicInfo(await dp100.getBasicInfo())}>Refresh status</button>
    </div>
    <div>
      {basicInfo && (
        <table border={1}>
          <tbody>
          <tr><td>IN</td><td>{(basicInfo.vin / 1000).toFixed(2)}V</td></tr>
          <tr><td>OUT</td><td>{(basicInfo.vout / 1000).toFixed(2)}V</td></tr>
          <tr><td>OUT_I</td><td>{(basicInfo.iout / 1000).toFixed(3)}A</td></tr>
          <tr><td>out_max</td><td>{(basicInfo.vo_max / 1000).toFixed(2)}V</td></tr>
          <tr><td>MODE</td><td>{basicInfo.out_mode === 2 ? 'OFF' : basicInfo.out_mode === 1 ? 'CV' : basicInfo.out_mode === 0 ? 'CC' : basicInfo.out_mode === 130 ? 'UVP' : 'unknown'}</td></tr>
          </tbody>
        </table>
      )}
    </div>
    <br />
    <div>
      <button onClick={async () => setBasicSet(await dp100.getCurrentBasic())}>Refresh settings</button>
    </div>
    <div>
      {basicSet && (
        <table border={1}>
          <tbody>
          <tr><td>VSET</td><td>{(basicSet.vo_set / 1000).toFixed(2)}V</td></tr>
          <tr><td>ISET</td><td>{(basicSet.io_set / 1000).toFixed(3)}A</td></tr>
          </tbody>
        </table>
      )}
    </div>
    </>
  )
}