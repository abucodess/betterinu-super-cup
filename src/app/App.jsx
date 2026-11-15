import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { BackgroundAnthemPlayer } from '../components/shared/BackgroundAnthemPlayer'

export function App() {
  return (
    <>
      <BackgroundAnthemPlayer />
      <RouterProvider router={router} />
    </>
  )
}
