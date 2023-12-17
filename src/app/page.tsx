'use client'

import styles from './page.module.css'
import { useRequestWebHIDDevice } from './webhid'
import { DP100_USB_INFO, useDP100 } from './dp100/dp100';

const filters = [DP100_USB_INFO];

export default function Home() {
  const { requestAndOpen, device, errorMessage } = useRequestWebHIDDevice({requestOptions: {filters}})
  return (
    <main className={styles.main}>
      { device === null ? null : (<DP100 device={device} />)}
      { device === null && requestAndOpen !== null ? <button onClick={requestAndOpen}>Connect</button> : null }
      { errorMessage !== null ? <div><b>{errorMessage}</b></div> : null }
    </main>
  )
}

interface IDP100Props {
  device: HIDDevice,
}
const DP100: React.FC<IDP100Props> = ({device}) => {
  const dp100 = useDP100({device})
  return (
    <>
    <div>
      Connected to <b>{device.productName}</b>
    </div>
    <div>
      <button onClick={dp100.requestBasicInfo}>Request info</button>
    </div>
    </>
  )
}