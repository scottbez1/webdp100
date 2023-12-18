'use client'

import { useEffect, useState } from "react";

export const useRequestWebHIDDevice = ({requestOptions}: {requestOptions: HIDDeviceRequestOptions}) => {
    const [device, setDevice] = useState<HIDDevice | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
    const requestAndOpen = async () => {
      setErrorMessage(null);
      try {
        const devices = await navigator.hid.requestDevice(requestOptions);
        if (devices.length > 0) {
          const selectedDevice = devices[0];
          try {
            await selectedDevice.open();
            setDevice(selectedDevice);
          } catch (error: any) {
            if (error.name === 'NotAllowedError') {
              setErrorMessage('Couldn\'t open the HID device. If you are on linux, make sure you\'ve installed the udev rules')
            } else {
              throw error
            }
          }
        } else {
          setErrorMessage('No device returned')
        }
      } catch (error) {
        setErrorMessage(`Error accessing HID device: ${error}`);
      }
    };

    useEffect(() => {
      if ('hid' in navigator) {
        const handleDisconnect = (e: HIDConnectionEvent) => {
          if (e.device === device) {
            console.log("Device disconnected!")
            setDevice(null)
          }
        }
        navigator.hid.addEventListener("disconnect", handleDisconnect);
        return () => {
          navigator.hid.removeEventListener("disconnect", handleDisconnect);
        }
      }
    }, [device])

    return {
      requestAndOpen: typeof window !== 'undefined' && 'hid' in navigator ? requestAndOpen : null,
      device,
      errorMessage,
    }
  };
